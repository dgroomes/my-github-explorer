# my-github-explorer

NOT YET FULLY IMPLEMENTED

⏯️A toy GitHub data explorer which I'm using to explore frontend tech like GraphiQL, Redux, React, TypeScript and Electron.


## Overview

This is a mash-up of front-end tech I'm interested in learning more deeply by way of a realistic application. I often
learn libraries, languages and frameworks by way of minimal runnable examples, but these small examples don't let
complex integration scenarios emerge. This project is an SPA that uses the GitHub GraphQL API and [GraphiQL](https://github.com/graphql/graphiql)
components to fetch metadata about repositories and present it using React. It also uses Redux and Electron. The amount
of side-effecting, stateful code and UI complexity is enough to really showcase how this tech works.

This is not an endorsement for any of these technologies.


## Instructions

Follow these instructions to build and serve the application:

1. Pre-requisite: Node.js
    * I used Node v20.9.0
2. Pre-requisite: `build-support`
    * **Important**: The `build-support` library must be built before you can develop the main application. Follow the
      instructions in the [`build-support` README](build-support/README.md). You only need to do this the first time and
      then any time you change `build-support`. Re-install it with the following command.
    * ```shell
      npm install --save-dev ./build-support/my-github-explorer_build-support-1.0.0.tgz
      ```
3. Install dependencies
    * ```shell
      npm install
      ```
4. Continuously build and run the app
    * ```shell
      npm start
      ```
5. Make the app distribution
    * ```shell
      npm run make
      ```
    * You will then need to find the `.dmg` file in the `out` directory and install it.


Tip: the GitHub personal access token is saved for convenience in an unencrypted file in a conventional directory in the
Electron app's installation directory. But you might want to blow this away to force the app through another flow. Use
this alias:

```shell
alias my-github-explorer-reset-token='rm "$HOME/Library/Application Support/my-github-explorer/pat"'
```


## Instructions for React and Redux Developer Tools

When you develop a React or Redux application, you'll likely want the power of their excellent developer tools: [React Developer Tools](https://react.dev/learn/react-developer-tools)
and [Redux DevTools](https://github.com/reduxjs/redux-devtools). In fact, using React and Redux come at a price and
these tools are essential to offset the cost.

Because we're in an Electron environment, it's a little tricky to install browser extensions, and it's an especially
tricky situation in 2024 with the inconsistent support for Manifest v2 and v3. Electron doesn't support Manifest v3 yet
but React Developer Tools doesn't support v2 anymore. Tricky. Thankfully, React Developer Tools and Redux DevTools can
each be run in a *standalone mode* by way of their npm-distributed CLI programs:

* [`react-devtools`](https://github.com/facebook/react/blob/main/packages/react-devtools/README.md)
* [`@redux-devtools/cli`](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-cli)

My preference is to run these standalone tools. By contrast, I am interested in using [browser extensions in Electron](https://www.electronjs.org/docs/latest/api/extensions),
but I'm not ready to figure out the compatibility workarounds (aforementioned v2/v3 quagmire).  

Follows these instructions to install and run the developer tools and connect to them from our app:

1. Install the tools globally:
    * ```shell
      npm install -g react-devtools @redux-devtools/cli@3.0.2
      ```
2. Run React Developer Tools in standalone mode:
    * ```shell
      react-devtools
      ```
3. Run a Redux DevTools server, and establish a connection from the web app
    * ```shell
      redux-devtools --open=browser --port=8000 --hostname=127.0.0.1
      ```
    * This starts the server and opens your web browser to <http://127.0.0.1:8000>. You need to configure the web app to
      connect to the server by going to the "Settings" tab and then clicking the "Use local (custom) server" radio button
      and clicking the "Connect" button.
4. Run our app but with a special flag to connect to the standalone React Developer Tools:
    * ```shell
      npm run start:with-devtools
      ```
5. Inspect the React components and Redux state.
    * Go back to the web app that hosts the Redux DevTools UI and **refresh the page** (I don't get why this is necessary).
    * You'll see the Redux state and state history of the program.
    * Go to the React Developer Tools Electron window and inspect the React components.
    * Develop -> Debug -> Develop -> Debug etc...


## Wish List

General clean-ups, todos and things I wish to implement for this project:

* [x] DONE Get token from storage using Electron's `safeStorage` API (well safe is always relative). This involves code across
  the main and renderer processes. Note: I've been writing hard-to-reason-about state-checking code to infer what work
  my code needs to take next. This is awkward because we're reconstituting the transition from the state but what would
* be more natural is if we could just do the work (or queue it up?) at the time we made the state change (i.e. transition)
  in the first place. For example, I set state to "storing" but then at a later invocation of the render function I use
  a combination of checking for "storing" and also `useEffects` dependencies to actually kick off the storing work. But
  it's like... at this point we're actually doing the storing work. Should I model it as "need-to-store" and "storing"
  and just jam descriptive states in the state? I don't really get it, but the nature of an async domain is tricky
  regardless. 
* [ ] (Update: maybe, maybe not) Abstract the token input/storage into a component
* [ ] Query (search) for the current user's repositories. Hardcode to a 100 limit (which is a limit of the API; then
  you'll need pagination)
* [ ] Query (get) the metadata for each of the repositories
* [ ] Display the information in a table using [React Table](https://react-table-v7.tanstack.com/) 
* [ ] Consider paginating through the results. This would be a cool application because we would see the table size grow.
* [ ] Show the pre-constructed queries in codemirror (using a GraphiQL component). We want the syntax highlighting. Can
  we make them read-only?
* [ ] HOLD (I want to wire in Redux dev tools before I do more conversion) Use Redux. I think I want to use Redux Sagas specifically. I don't grok Redux. I need to learn it an app that
  "does real things" like make HTTP requests and handles a rich UI. Hopefully I'll get it. I'm expecting the Redux
  devtools will be particularly useful, but jury is out.
   * DONE Start by bringing in the dependencies and maybe doing a "hello world".
   * DONE Port one instance of `setState` to Redux. The lowest level (the leaf node) is where `useEffect` uses `setState`.
     We'll port over all other usages and the `useEffect` usages in a later task.
     * DONE Redux wants only serializable data in the state. Makes sense (although profoundly limiting; but
       constraints can be good). Take only what I need in place of the `Response`
       object.
   * Port everything else to Redux
   * Add in Sagas (also "hello world")
   * Here is the real experiment: can we figure out how to implement the logic in Sagas?
* [x] DONE Add Redux DevTools.
   * Note: I completely misread the docs. I thought there was no standalone launcher for Redux DevTools, but there is.
     It's called redux-devtools-cil.
   * DONE Add instructions for running Redux DevTools from its CLI.
   * DONE Add Redux DevTools client side stuff and make sure it can be connected to from the dev tool instance.
   * DONE Co-opt the `start:react-devtools` script to also start the Redux DevTools. And figure out [how to exclude
     the package from the production build](https://github.com/reduxjs/redux-devtools/blob/main/docs/Walkthrough.md#exclude-devtools-from-production-builds). 
* [ ] Consider enforcing `noImplicitAny`
* [x] DONE Consider adding Prettier or something. I'm mostly annoyed with arbitrarily using double and single quotes and using
  and not using semicolons.
* [x] DONE (fixed, but `useFetch` now doesn't make sense. How do people do this? Just ignore unmounts for the clean up function?)
      Defect: validation fetch request is getting cancelled prematurely. My `useFetch` must be buggy.


## Finished Wish List Items

* [x] DONE Scaffold the project
* [x] DONE Prompt for an access token. Validate the access token with a request to the GitHub API. Give
  informational UI feedback.
* [x] DONE Query for the current user's login (assuming the token is a user token)
* [x] DONE (I like it very much) Model the PAT using some kind of types. I want to model the state machine a lot more cleanly than the mess of
  `useState` and nullability I have now.
* [x] DONE (I accomplished an abstraction but it is not great) Abstract the "useEffect unmount clean up fetch abort" stuff into generic code. I'm assuming there must be some
  concise API to derive for this common use case.
* [x] DONE Abstract the token validation into a hook
* [x] DONE Extract into its own repository
* [x] DONE Turn this into an Electron app (primarily because I want native secrets)
  * This was extremely larger than I anticipated. Went down a rabbit hole here: <https://github.com/dgroomes/electron-playground/tree/main/realistic>
    I'll port over the same thing.
  * DONE Port over `build-support`
  * DONE Port over `package-json.mjs` style.
  * DONE Add `main.js` file for Electron main process.
  * DONE .gitignore
  * DONE Get it to build and add instructions to README.
  * DONE tsconfig changes
  * DONE Get the styles to work. I need to figure out how to import the CSS from GraphiQL again.
  * Make sure React DevTools works
* [x] DONE Upgrade dependencies.
* [x] DONE (GraphiQL defines fonts in data URLs) Why are there HTTP request failures to download fonts? E.g. `data:font/woff2;base64,` etc. This happens when
  serving but not in the production app.


## Reference

* [GitHub GraphQL API](https://docs.github.com/en/graphql)
* [GitHub docs: *Search within a user's or organization's repositories*](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories#search-within-a-users-or-organizations-repositories)
* [MDN docs: *AbortController*](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
  * I just stumbled on this interesting, modern API. I'm tempted to write my `useEffect` invocations to use it and also
    the 'unmounted' check to do things "the right way". I think I am going to do this. Now, I'm realizing this should
    really be in my `react-playground` repo but for now it's ok. Progress. Functional programming is nice but hey we
    have tons of I/O and stateful stuff.
* <https://github.com/dgroomes/electron-playground>
* <https://github.com/dgroomes/react-playground>
* <https://github.com/dgroomes/redux-playground>
* <https://github.com/dgroomes/graphiql-playground>
