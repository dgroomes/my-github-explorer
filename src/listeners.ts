import { TokenSlice } from "./token-slice";
import { logger } from "./log";
import {RootState} from "./RootState";
import {ListenerMiddlewareInstance} from "@reduxjs/toolkit";

const log = logger("listeners");
const { setToken, setShouldStoreAfterValidation } = TokenSlice.actions;

type ListenerOptions = Parameters<ListenerMiddlewareInstance<RootState>['startListening']>[0];

/**
 * When the state goes from "init" to "restoring", we want to kick off the token restoration process.
 */
export const tokenRestoreListener : ListenerOptions = {
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
