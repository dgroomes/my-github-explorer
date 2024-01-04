/*
DEPRECATED: DO NOT USE THIS. See the later comment about aborting fetch requests upon unmounting and why that's a
problem.

Most React applications make HTTP requests, and they do that within a 'useEffect' hook (well, do we really really really need to do that??).
There is a fair amount of boilerplate that goes along with this. Namely, we want to keep track of whether the component
is mounted or not, and we want to abort the request if the component is unmounted.

The 'useFetch' hook defined here is a 'fetch' wrapper for React. The 'useFetch' hook takes the same parameters as 'fetch'
but instead of returning a promise, it returns the state of the 'fetch' operation: 'in-flight', 'error', or the response
data. It is vaguely similar to the main function signature of *TanStack Query* (formerly known as *React Query*).

Consider using 'useFetch' under the following conditions:

* You want to do exactly one HTTP request when the component is mounted
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

import { useEffect, useState } from "react";
import { logger } from "./code";

const log = logger("useFetch");

export function useFetch(
  fetchParams: { input: RequestInfo | URL; init?: RequestInit } | "no-op",
): "untriggered" | "in-flight" | Error | { response: Response; json: string } {
  if (fetchParams === "no-op") {
    log("Invoked as a no-op.");
  } else {
    log("Invoked with fetch parameters.");
  }
  let [state, setState] = useState<"untriggered" | "in-flight" | Error | { response: Response; json: string }>(
    "untriggered",
  );

  useEffect(() => {
    if (fetchParams === "no-op") {
      // This is so odd. The React way is to execute "render" functions as the main engine of the program and so
      // we as application developers have to deal with unexpected, unintuitive, and undesirable invocations of
      // our code that doesn't directly relate to rendering, including layers deeps like in a useEffect callback
      // inside a custom React hook used by a custom component.
      log("'no-op' indicated. The calling code is not actually interested in triggering a fetch request.");
      return;
    }

    if (state === "in-flight") {
      log("Already in-flight.");
      return;
    }

    if (state === "untriggered") {
      // This is not idiomatic. I'm confused, but I'm going to carry on so I can "learn by doing".
      log("Untriggered. Ready to execute the fetch request. Setting state to 'in-flight'.");
      state = "in-flight";
      setState(state);
    }

    const { input, init } = fetchParams;

    // We need to wire in the abort signal to the user's fetch options.
    const controller = new AbortController();
    const signal = controller.signal;
    const options = {
      ...init,
      signal,
    };
    let isMounted = true;

    // Execute the fetch and bail out if the component is unmounted or the request was aborted.
    log("Executing the 'fetch' request...");
    fetch(input, options)
      .then((res) => {
        log("The 'fetch' request completed.");
        if (signal.aborted)
          return Promise.reject(
            new Error("The request was aborted. Short-circuiting the remainder of the 'useFetch' hook."),
          );
        if (!isMounted)
          return Promise.reject(
            new Error("The component is no longer mounted. Short-circuiting the remainder of the 'useFetch' hook."),
          );

        return res.json().then((json) => {
          setState({ response: res, json });
        });
      })
      .catch((err) => {
        log("The 'fetch' request failed.", { err });
        if (isMounted && !signal.aborted) {
          setState(err);
        }
      });

    // UPDATE: This is the crux of my problems. React is going to frequently mount/unmount components for various
    // reasons. There is value in understanding this lifecycle and understanding how your code relates to it, but
    // the fact is that the recognizable structure of your application logic and application UI is powered by an
    // unknowable system of interstitial invocations of renders/mounts/unmounts by React. That's why React's advice
    // is "hey try to make things pure functions". But of course, that's not possible. Our interest in executing a
    // fetch request (to validate the GitHub personal access token, for example) spans longer than the in-between
    // moments of these mount/unmounts. If we were to abort the fetch request upon unmount, that's bad. That's
    // premature. That's why the code is commented out. In fact, this whole hook is now useless because
    // it was designed to handle abort signals, but now I've figured out this is not a useful feature.
    //
    // Interestingly, TanStack Query also alludes to this problem in their documentation on "Query Cancellation": https://tanstack.com/query/latest/docs/react/guides/query-cancellation
    // It reads:
    //
    //   By default, queries that unmount or become unused before their promises are resolved are not cancelled.
    //   This means that after the promise has resolved, the resulting data will be available in the cache. This is
    //   helpful if you've started receiving a query, but then unmount the component before it finishes. If you
    //   mount the component again and the query has not been garbage collected yet, data will be available.
    //
    // This is a "clean-up" function that React calls when the component is unmounted.
    // return () => {
    //     log("The component is unmounting. Aborting the 'fetch' request.")
    //     isMounted = false
    //     controller.abort()
    // }
  }, [fetchParams]);

  return state;
}
