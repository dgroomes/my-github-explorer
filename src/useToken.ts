import {Dispatch, SetStateAction, useState} from "react";
import {useFetch} from "./useFetch";

/**
 * A custom React hook for storing and validating a GitHub personal access token.
 *
 * I'm not sure this is idiomatic React, but I'm trying to learn hooks and experimenting.
 */
export function useToken(): [TokenState, Dispatch<SetStateAction<TokenState>>] {
    const [token, setToken] = useState<TokenState>('empty')

    let fetchParams: { input: RequestInfo | URL, init?: RequestInit } | undefined

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
    }


    const fetched = useFetch(fetchParams)

    if (fetched === 'in-flight') {
        console.log("The 'useToken' hook is in-flight. Returning the token.")
        return [token, setToken];
    }

    if (fetched === 'untriggered') {
        console.log("The 'useToken' hook is untriggered. Returning the token.")
        return [token, setToken];
    }

    if (typeof token !== 'object' || token.kind !== "entered") {
        // This is nasty. I'm having difficulty composing my code with 'useEffect'. It's hard to satisfy the requirement of "hooks must be called at the top level and never in a conditional".
        throw new Error("This should never happen. The token should be an object with kind 'entered' at this point.")
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
        console.log("GitHub API responded with 401 Unauthorized. The token is invalid.")
        setToken({
            kind: "invalid",
            token: token.token
        })
    }

    const login = json["data"]["viewer"]["login"]
    console.log(`GitHub login: ${login}`)
    setToken({
        kind: "valid",
        token: token.token,
        login: login
    })
    return [token, setToken];
}
