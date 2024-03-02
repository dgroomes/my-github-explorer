import { configureStore, createListenerMiddleware, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import monolithicReducer, { MonolithicState, setShouldStoreAfterValidation, setToken } from "./monolithicSlice";
import { customizeWebpackConfigForDevelopment } from "redux-config-customizer";
import {logger} from "./code";

const log = logger("store");

const listenerMiddleware: ListenerMiddlewareInstance = createListenerMiddleware();
listenerMiddleware.startListening({
    // When the state goes from "init" to "restoring", we want to kick off the token restoration process.
    predicate: (action, _currentState, _previousState) => {
        // There's a chicken and egg problem with the type inference. The indirection goes beyond any type system I've
        // had to deal with before, so we'll take advantage of good old dynamic typing.
        // @ts-ignore
        const previousState = _previousState.monolithic as MonolithicState;
        // @ts-ignore
        const currentState = _currentState.monolithic as MonolithicState;

        return previousState.tokenState === "init" && currentState.tokenState === "restoring"
    },
    effect: (action, listenerApi) => {
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
    }
})

export const store = configureStore(
  customizeWebpackConfigForDevelopment({
    reducer: {
      monolithic: monolithicReducer,
    },
    // This is tricky. The listener middleware specifically has to come before the regular middleware components because
    // the listener middleware accepts non-serializable objects, but the essence of Redux is about instrumenting your
    // serialized state.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  }),
);

// I don't understand how this works, but this is needed when using Redux Toolkit with TypeScript.
// See https://redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
