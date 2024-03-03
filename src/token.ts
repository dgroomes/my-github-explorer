/*
Code related to managing a GitHub personal access token.
*/

import {createSlice, ListenerMiddlewareInstance, PayloadAction} from "@reduxjs/toolkit";
import {logger} from "./log";
import {RootState} from "./types";

const log = logger("token.ts");

export interface TokenState {
  token: Token;
  shouldStoreAfterValidation: boolean;
}

const initialState: TokenState = {
  token: "init",
  shouldStoreAfterValidation: false,
};

export const TokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    /**
     * This is an idempotent action. If the token is already in the process of being restored or has fully restored,
     * then this action does nothing.
     * @param state
     */
    restoreToken(state) {
      const log = logger("restoreToken");

      if (state.token === "init") {
        log("The token was in the initial state. It will be set to 'restoring'.");
        state.token = "restoring";
      } else {
        log("The token was already in the process of being restored or has fully restored.");
      }
    },
    setToken(state, action: PayloadAction<Token>) {
      state.token = action.payload;
    },
    setShouldStoreAfterValidation(state, action: PayloadAction<boolean>) {
      state.shouldStoreAfterValidation = action.payload;
    },
  },
});

const { setToken, setShouldStoreAfterValidation } = TokenSlice.actions;

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

type ListenerOptions = Parameters<ListenerMiddlewareInstance<RootState>["startListening"]>[0];
/**
 * When the state goes from "init" to "restoring", we want to kick off the token restoration process.
 */
export const tokenRestoreListener: ListenerOptions = {
  predicate: function transitionedToRestoring(_action, currentState, previousState) {
    return previousState.token.token === "init" && currentState.token.token === "restoring";
  },
  effect: function restoreToken(_action, listenerApi) {
    log("Restoring token...");
    window.api
      .getPersonalAccessToken()
      .then((token) => {
        if (token === null) {
          log("No token found. Token not restored.");
          listenerApi.dispatch(setToken("empty"));
          listenerApi.dispatch(setShouldStoreAfterValidation(true));
        } else {
          log("A token was found. Token restored.");
          listenerApi.dispatch(setToken({ kind: "restored", token: token }));
        }
      })
      .catch((err) => {
        log("Something went wrong while trying to get the token from the backend via IPC.", { err });
        listenerApi.dispatch(
          setToken({
            kind: "error",
            error: err,
          }),
        );
      });
  },
};
