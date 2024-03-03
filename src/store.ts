import { configureStore, createListenerMiddleware, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import monolithicReducer, { setShouldStoreAfterValidation, setToken } from "./monolithicSlice";
import { customizeWebpackConfigForDevelopment } from "redux-config-customizer";
import { logger } from "./code";

const log = logger("store");

const listenerMiddlewareNoType: ListenerMiddlewareInstance = createListenerMiddleware();

export const store = configureStore(
  customizeWebpackConfigForDevelopment({
    reducer: {
      monolithic: monolithicReducer,
    },
    // This is tricky. The listener middleware specifically has to come before the regular middleware components because
    // the listener middleware accepts non-serializable objects, but the essence of Redux is about instrumenting your
    // serialized state.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddlewareNoType.middleware),
  }),
);

// I don't understand how this works, but this is needed when using Redux Toolkit with TypeScript.
// See https://redux.js.org/tutorials/typescript-quick-start
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const listenerMiddleware = listenerMiddlewareNoType as ListenerMiddlewareInstance<RootState>;
