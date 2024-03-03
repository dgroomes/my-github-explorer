import React from "react";
import GitHubGraphiQL from "./GitHubGraphiQL";

export function MainElement() {
  return (
    <>
      <h1>dgroomes/my-github-explorer</h1>
      <p>
        Browsing my GitHub repositories. See the README in the{" "}
        <a href="https://github.com/dgroomes/my-github-explorer">dgroomes/my-github-explorer</a> GitHub repository for
        more information.
      </p>
      <GitHubGraphiQL />
    </>
  );
}
