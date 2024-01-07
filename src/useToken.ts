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
 */
export function useToken(): [TokenState, Dispatch<SetStateAction<TokenState>>] {
  log("Invoked.");
  const [token, setToken] = useState<TokenState>("restoring");
  const [shouldStoreAfterValidation, setShouldStoreAfterValidation] = useState(false);
  if (typeof token === "object") {
    log({ kind: token.kind });
  } else if (token === "empty") {
    log("Token is empty");
  } else if (token === "restoring") {
    log("Token is restoring.");
  }

  useEffect(() => {
    if (token !== "restoring") return;

    window.api
      .getPersonalAccessToken()
      .then((token) => {
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
      })
      .catch((err) => {
        log("Something went wrong while trying to get the token from the backend via IPC.", { err });
        setToken({
          kind: "error",
          error: err,
        });
      });
  }, [token]);

  useEffect(() => {
    if (typeof token === "object" && (token.kind === "entered" || token.kind === "restored")) {
      setToken({ kind: "validating", token: token.token });
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

          if (res.status != 200) {
            return res.text().then((text) => {
              throw new Error(`Unexpected response from GitHub API. HTTP status: ${res.status}. Message: ${text}`);
            });
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
          log(err);
          setToken({
            kind: "error",
            error: "An unexpected error occurred while validating the token. See the console logs for more details.",
          });
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
        .catch((e) => {
          log("Something went wrong while trying to save the token to the backend via IPC.", { e });
          setToken({
            kind: "error",
            error: "An unexpected error occurred while saving the token.",
          });
        });
    }
  }, [token]);

  return [token, setToken];
}
