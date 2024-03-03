/*
Code related to managing a GitHub personal access token.
*/

export type Token = "init" | "restoring" | "empty" | EnteredToken | ValidatedToken | Error;

export interface EnteredToken {
  kind: "partial" | "entered" | "validating" | "restored" | "invalid";
  token: string;
}

export interface Error {
  kind: "error";
  error: string;
}

export interface ValidatedToken {
  kind: "valid" | "storing";
  token: string;
  login: string;
}
