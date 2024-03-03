import {setShouldStoreAfterValidation, setToken} from "./monolithicSlice";
import {RootState} from "./store";
import {logger} from "./code";
import {ListenerMiddlewareInstance} from "@reduxjs/toolkit";

const log = logger("listeners");

export function registerListeners(listenerMiddleware: ListenerMiddlewareInstance<RootState>) {
    listenerMiddleware.startListening({
        // When the state goes from "init" to "restoring", we want to kick off the token restoration process.
        predicate: function transitionedToRestoring(_action, currentState, previousState) {
            return previousState.monolithic.tokenState === "init" && currentState.monolithic.tokenState === "restoring";
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
    });
}
