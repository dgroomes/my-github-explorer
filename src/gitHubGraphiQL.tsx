import React from "react";
import GraphiQL from "graphiql";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { Alert, Button, Input, Space, Spin } from "antd";
import { useToken } from "./useToken";
import { logger } from "./code";
import { useAppDispatch } from "./hooks";
import { setToken } from "./monolithicSlice";

const log = logger("GitHubGraphiQL");

/**
 * This is one of the main components. I need to extract some of this into smaller components/hooks. I want to use the
 * "Main" component as the actual main component.
 *
 * This component has some logic to request/validate a GitHub personal access token.
 */
export default function GitHubGraphiQL() {
  log("Invoked.");
  const dispatch = useAppDispatch();
  const token = useToken();
  if (typeof token === "object") {
    log({ kind: token.kind });
  } else if (token === "empty") {
    log("Token is empty.");
  }

  // Well, I refactored this to be more "algebraic data types"-like but the nesting is a bit much and so is the
  // duplicated input/button stuff.
  if (token === "empty") {
    return (
      <Space direction="horizontal">
        <Input.Password
          placeholder="input GitHub personal access token"
          visibilityToggle={false}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(setToken({ kind: "partial", token: e.target.value }));
          }}
        />
        <Button disabled={true}> Submit</Button>
      </Space>
    );
  } else if (token === "restoring") {
    return (
      <Space direction="horizontal">
        <Input.Password readOnly={true} disabled={true} visibilityToggle={false} placeholder="Restoring token..." />
        <Spin />
      </Space>
    );
  } else {
    if (token.kind === "invalid") {
      return (
        <Alert
          message="Error"
          description="This token is invalid according to the GitHub API. Please double check your token."
          type="error"
          showIcon
        />
      );
    } else if (token.kind === "error") {
      return <Alert message="Error" description={token.error} type="error" showIcon />;
    } else if (
      token.kind === "restored" ||
      token.kind === "entered" ||
      token.kind === "validating" ||
      token.kind === "storing"
    ) {
      return (
        <Space direction="horizontal">
          <Input.Password readOnly={true} disabled={true} visibilityToggle={false} placeholder="Validating token..." />
          <Spin />
        </Space>
      );
    } else if (token.kind === "partial") {
      return (
        <Space direction="horizontal">
          <Input.Password
            placeholder="input GitHub personal access token"
            visibilityToggle={false}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch(setToken({ kind: "partial", token: e.target.value }));
            }}
          />
          <Button onClick={() => dispatch(setToken({ kind: "entered", token: token.token }))}>Submit</Button>
        </Space>
      );
    } else {
      const defaultQuery = `
{
    search(query: "user:dgroomes", type: REPOSITORY, first: 100) {
        repositoryCount
        edges {
            node {
                ... on Repository {
                    name
                }
            }
        }
    }
}
`;
      const fetcher = createGraphiQLFetcher({
        url: "https://api.github.com/graphql",
        headers: {
          Authorization: `bearer ${token.token}`,
        },
      });

      return (
        <>
          <Alert
            message="TODO"
            description="The token was validated, but the rest of the application has not been implemented yet."
            type="info"
            showIcon
          />
          <GraphiQL fetcher={fetcher} defaultQuery={defaultQuery} />
        </>
      );
    }
  }
}
