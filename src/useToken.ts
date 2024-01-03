import {Dispatch, SetStateAction, useState} from "react";
import {useFetch} from "./useFetch";
import {TokenState, logger} from "./code";

const log = logger("useToken");

/**
 * A custom React hook for storing and validating a GitHub personal access token.
 *
 * This is not working well as a custom React hook. It might be better as a component or just externalized to non-React
 * code. I've struggled and learned some things. But I'm still not clear on the right way to do this.
 */
export function useToken(): [TokenState, Dispatch<SetStateAction<TokenState>>] {
    log(" Invoked.");
    const [token, setToken] = useState<TokenState>('empty')
    if (typeof token === "object") {
        log({kind: token.kind});
    } else if (token === "empty") {
        log("Token is empty");
    }

    let fetchParams: { input: RequestInfo | URL, init?: RequestInit } | 'no-op'

    if (typeof token === 'object' && token.kind === "entered") {
        const query = `
  query {
    viewer {
      login
    }
  }
`
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${token.token}`
            },
            body: JSON.stringify({query}),
        }

        fetchParams = {input: "https://api.github.com/graphql", init: options}
    } else {
        fetchParams = "no-op";
    }

    const fetched = useFetch(fetchParams)

    if (fetched === 'in-flight') {
        log("The 'useFetch' hook is in-flight. Returning.")
        return [token, setToken];
    }

    if (fetched === 'untriggered') {
        log("The 'useFetch' hook is untriggered. Returning.")
        return [token, setToken];
    }

    if (typeof token === "object" && (token.kind === "valid" || token.kind === "invalid")) {
        log("The token has already finished the validation process. Returning.");
        return [token, setToken];
    }

    if (typeof token !== 'object' || !(token.kind === "entered" || token.kind === "validating")) {
        // This is nasty. I'm having difficulty composing my code with 'useEffect'. It's hard to satisfy the requirement of "hooks must be called at the top level and never in a conditional".
        throw new Error("This should never happen. The token should be an object with kind 'entered' or 'validating' at this point.")
    }

    if (fetched instanceof Error) {
        setToken({
            kind: "invalid",
            token: token.token
        })
        return [token, setToken];
    }

    const {response, json} = fetched

    if (response.status == 401) {
        log("GitHub API responded with 401 Unauthorized. The token is invalid.")
        setToken({
            kind: "invalid",
            token: token.token
        })
    } else {
        const login = json["data"]["viewer"]["login"]
        log(`GitHub login: ${login}`)
        setToken({
            kind: "valid",
            token: token.token,
            login: login
        })
    }
    return [token, setToken];
}
