import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFetch } from "./useFetch";
import { TokenState, logger } from "./code";

const log = logger("useToken");

/**
 * A custom React hook for restoring, saving and validating a GitHub personal access token.
 *
 *
 * {@link useToken} starts by trying to recover a previously saved token from the backend via IPC. If there is one, it
 * gets used. If not, the hook waits on the user to enter a token in the UI. After a token is restored or entered, the
 * hook validates it using the GitHub API. The hook gives the validated token the backend via IPC to store it.
 *
 * This is not working well as a custom React hook. It might be better as a component or just externalized to non-React
 * code. I've struggled and learned some things. But I'm still not clear on the right way to do this.
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

  let fetchParams: { input: RequestInfo | URL; init?: RequestInit } | "no-op";

  if (typeof token === "object" && (token.kind === "entered" || token.kind === "restored")) {
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

    fetchParams = { input: "https://api.github.com/graphql", init: options };
  } else {
    fetchParams = "no-op";
  }

  const fetched = useFetch(fetchParams);
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

  if (fetched === "in-flight") {
    log("The 'useFetch' hook is in-flight. We need to wait for it.");
    return [token, setToken];
  }

  if (fetched === "untriggered") {
    log("The 'useFetch' hook is untriggered. We need to wait until its triggered.");
    return [token, setToken];
  }

  if (typeof token === "object" && (token.kind === "valid" || token.kind === "invalid")) {
    log("The token has already finished the validation process.");
    return [token, setToken];
  }

  if (typeof token === "object" && token.kind === "storing") {
    log("The token is storing.");
    return [token, setToken];
  }

  if (typeof token !== "object" || !(token.kind === "entered" || token.kind === "restored")) {
    // This is nasty. I'm having difficulty composing my code with 'useEffect'. It's hard to satisfy the requirement of "hooks must be called at the top level and never in a conditional".
    throw new Error(
      "This should never happen. The token should be an object with kind 'entered' or 'restored' at this point.",
    );
  }

  if (fetched instanceof Error) {
    setToken({
      kind: "invalid",
      token: token.token,
    });
    return [token, setToken];
  }

  const { response, json } = fetched;

  if (response.status == 401) {
    log("GitHub API responded with 401 Unauthorized. The token is invalid.");
    setToken({
      kind: "invalid",
      token: token.token,
    });
  } else {
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
  }
  return [token, setToken];
}
