/*
Most React applications make HTTP requests and they do that within a 'useEffect' hook (well, do we really really really need to do that??).
There is a fair amount of boilerplate that goes along with this. Namely, we want to keep track of whether the component
is mounted or not, and we want to abort the request if the component is unmounted.

The 'useFetch' hook defined here is a 'fetch' wrapper for React. The 'useFetch' hook takes the same parameters as 'fetch'
but instead of returning a promise, it returns the state of the 'fetch' operation: 'in-flight', 'error', or the response
data. It is vaguely similar to the main function signature of "React Query".

Consider using 'useFetch' under the following conditions:

* You want to do exactly one HTTP request when the component is mounted
* You want to abort the request if the component is unmounted
* You want to not update state if the fetch completes after the component is mounted (avoid memory leaks)
* You want the result of the fetch cached. Subsequent invocations of 'useEffect', given the same parameters, return the
  cached data.
* You are targeting browsers that support the 'fetch' API
* You are calling an HTTP endpoint that returns JSON in the response body.

This snippet is a helper function that takes care of all of that boilerplate for you. Namely, it uses the 'fetch' API
and the abort types (AbortController, or AbortSignal). Here's an example:

function MyDashboardComponent(props) {
  const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query: props.query }),
            }
  const dashboardData = useFetch("https://api.github.com/graphql", options)

  if (dashboardData === 'in-flight') {
     return <LoadingSpinner />
  }

  if (dashboardData === 'error') {
      return <ErrorComponent />
  }

  // Build the dashboard UI from the data
  ... omitted ...
}
 */

import {useEffect, useState} from 'react'

export function useFetch(fetchParams?: { input: RequestInfo | URL, init?: RequestInit }): 'untriggered' | 'in-flight' | Error | { response: Response, json: string } {
    let [state, setState] = useState<'untriggered' | 'in-flight' | Error | { response: Response, json: string }>('untriggered')

    useEffect(() => {

        // Let's see if the user-provided callback function returns a 'fetch' params or not. If not, then they are not
        // ready to do a fetch yet. We'll just return.
        if (fetchParams === null || fetchParams === undefined) return

        if (state === 'in-flight') {
            console.log("The 'useFetch' hook is already in-flight. Ignoring the request to fetch again.")
            return
        }

        if (state === 'untriggered') {
            // This is not idiomatic. I'm confused, but I'm going to carry on so I can "learn by doing".
            console.log("The 'useFetch' hook is untriggered. Setting the state to 'in-flight'.")
            state = 'in-flight'
            setState(state)
        }

        const {input, init} = fetchParams

        // We need to wire in the abort signal to the user's fetch options.
        const controller = new AbortController();
        const signal = controller.signal;
        const options = {
            ...init,
            signal
        }
        let isMounted = true

        // Execute the fetch and bail out if the component is unmounted or the request was aborted.
        fetch(input, options)
            .then(res => {
                console.log("The 'fetch' request completed.")
                if (signal.aborted) return Promise.reject(new Error("The request was aborted. Short-circuiting the remainder of the 'useFetch' hook."))
                if (!isMounted) return Promise.reject(new Error("The component is no longer mounted. Short-circuiting the remainder of the 'useFetch' hook."))

                return res.json().then(json => {
                    setState({response: res, json})
                })
            })
            .catch(err => {
                console.log("The 'fetch' request failed.")
                if (isMounted && !signal.aborted) {
                    setState(err)
                }
            })

        // This is a "clean-up" function that React calls when the component is unmounted.
        return () => {
            isMounted = false
            controller.abort()
        }
    }, [fetchParams])

    return state
}
