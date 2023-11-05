# my-github-explorer

NOT YET FULLY IMPLEMENTED

⏯ A toy GitHub data explorer which I'm using to explore frontend tech like GraphiQL, React hooks, and Redux.


## Overview

This an application of the GraphiQL library that uses some of its components to create a simple "repository metadata
lister" user interface. It is an SPA that uses the GitHub GraphQL API to list the metadata of a user's repositories.
The purpose of this project is to be an intermediate showcase of GraphiQL, focussed on its React components.

UPDATE 2023-11-05: This project has ballooned a little bit because I implemented a custom `useFetch` hook (which I really
like) and now I want to use this project as a means to explore Redux in a "real app". I promoted this from my [graphiql-playground](https://github.com/dgroomes/graphiql-playground)
repo into its own repository.


## Instructions

Follow these instructions to build and serve the program:

1. Install the dependencies
    * ```shell
      npm install
      ```
2. Serve the content (and build continuously)
    * ```shell
      npm start
      ```
3. Open the browser
    * Open <http://[::1]:8080>
    * Click around the UI and iterate!


## Wish List

General clean-ups, todos and things I wish to implement for this project:

* [x] DONE Scaffold the project
* [x] DONE Prompt for an access token. Validate the access token with a request to the GitHub API. Give
  informational UI feedback.
* [x] DONE Query for the current user's login (assuming the token is a user token)
* [x] DONE (I like it very much) Model the PAT using some kind of types. I want to model the state machine a lot more cleanly than the mess of
  `useState` and nullability I have now.
* [x] DONE (I accomplished an abstraction but it is not great) Abstract the "useEffect unmount clean up fetch abort" stuff into generic code. I'm assuming there must be some
  concise API to derive for this common use case.
* [ ] Abstract the token input/storage into a component
* [x] DONE Abstract the token validation into a hook
* [ ] Query (search) for the current user's repositories. Hardcode to a 100 limit (which is a limit of the API; then
  you'll need pagination)
* [ ] Query (get) the metadata for each of the repositories
* [ ] Display the information in a table using [React Table](https://react-table-v7.tanstack.com/) 
* [ ] Consider paginating through the results. This would be a cool application because we would see the table size grow.
* [ ] Show the pre-constructed queries in codemirror (using a GraphiQL component). We want the syntax highlighting. Can
  we make them read-only?
* [x] DONE Extract into its own repository
* [ ] Turn this into an Electron app (primarily because I want native secrets)
* [ ] Use Redux. I think I want to use Redux Sagas specifically. I don't grok Redux. I need to learn it an app that
  "does real things" like make HTTP requests and handles a rich UI. Hopefully I'll get it. I'm expecting the Redux
  devtools will be particularly useful, but jury is out.


## Reference

* [GitHub GraphQL API](https://docs.github.com/en/graphql)
* [GitHub docs: *Search within a user's or organization's repositories*](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories#search-within-a-users-or-organizations-repositories)
* [MDN docs: *AbortController*](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
  * I just stumbled on this interesting, modern API. I'm tempted to write my `useEffect` invocations to use it and also
    the 'unmounted' check to do things "the right way". I think I am going to do this. Now, I'm realizing this should
    really be in my `react-playground` repo but for now it's ok. Progress. Functional programming is nice but hey we
    have tons of I/O and stateful stuff.