import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { logger, TokenState } from "./code";

const log = logger("useToken");

/**
 * A custom React hook for restoring, saving and validating a GitHub personal access token.
 *
 *
 * {@link useToken} starts by trying to recover a previously saved token from the backend via IPC. If there is one, it
 * gets used. If not, the hook waits on the user to enter a token in the UI. After a token is restored or entered, the
 * hook validates it using the GitHub API. The hook gives the validated token the backend via IPC to store it.
 *
 * Modeling "restoring" on {@link TokenState} is not symmetrical to modeling "isFetching" inside this hook. Consider
 * refactoring this.
 */
export function useToken(): [TokenState, Dispatch<SetStateAction<TokenState>>] {
  log("Invoked.");
  const [token, setToken] = useState<TokenState>("restoring");
  const [shouldStoreAfterValidation, setShouldStoreAfterValidation] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  if (typeof token === "object") {
    log({ kind: token.kind });
  } else if (token === "empty") {
    log("Token is empty");
  } else if (token === "restoring") {
    log("Token is restoring.");
  }

  useEffect(() => {
    if (token !== "restoring") return;

    window.api.getPersonalAccessToken().then((token) => {
      if (token === null) {
        log("No token was found.");
        setToken("empty");
        setShouldStoreAfterValidation(true);
      } else {
        log("A token was found.");
        setToken({
          kind: "restored",
          token: token,
        });
      }
    });
  }, [token]);

  useEffect(() => {
    if (typeof token === "object" && (token.kind === "entered" || token.kind === "restored")) {
      setIsFetching(true);
      const query = `
  query {
    viewer {
      login
    }
  }
`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token.token}`,
        },
        body: JSON.stringify({ query }),
      };

      const fetchParams = { input: "https://api.github.com/graphql", init: options };
      log("Executing the 'fetch' request...");
      fetch(fetchParams.input, fetchParams.init)
        .then((res) => {
          log("The 'fetch' request completed.");
          if (res.status == 401) {
            log("GitHub API responded with 401 Unauthorized. The token is invalid.");
            setToken({
              kind: "invalid",
              token: token.token,
            });
            return;
          }

          return res.json();
        })

        .then((json) => {
          const login = json["data"]["viewer"]["login"];
          log("The token was found to be valid. GitHub login: ", login);

          // Note: this is verbose and circuitous...
          if (shouldStoreAfterValidation) {
            setToken({
              kind: "storing",
              token: token.token,
              login: login,
            });
          } else {
            setToken({
              kind: "valid",
              token: token.token,
              login: login,
            });
          }
        })
        .catch((err) => {
          log("The 'fetch' request failed.", { err });
          // TODO Set token state to an error so that the using component can render user-friendly error message
        });
    }
  }, [token]);

  useEffect(() => {
    if (typeof token === "object" && token.kind === "storing") {
      window.api
        .savePersonalAccessToken(token.token)
        .then(() => {
          log("The token was stored to the backend via IPC.");
          setToken({
            kind: "valid",
            token: token.token,
            login: token.login,
          });
        })
        .catch((e) => log("Something went wrong while trying to save the token to the backend via IPC.", { e }));
    }
  }, [token]);

  return [token, setToken];
}
