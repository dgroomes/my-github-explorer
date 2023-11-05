import React from "react";
import GitHubGraphiQL from "./gitHubGraphiQL";

export function Main() {
    return (<>
        <h1>dgroomes/graphiql-playground</h1>
        <p>
            Browsing my GitHub repositories. See the README in the <a href="https://github.com/dgroomes/graphiql-playground">dgroomes/graphiql-playground</a> GitHub repository for more information.
        </p>
        <GitHubGraphiQL/>
    </>)
}
