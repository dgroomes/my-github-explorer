import { configureStore, createListenerMiddleware, EnhancedStore, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import monolithicReducer, { MonolithicState } from "./monolithicSlice";
import { customizeWebpackConfigForDevelopment } from "redux-config-customizer";
import { logger } from "./code";

const log = logger("store");

/**
 * Initialize an instance of the Redux software machinery. I like to think of this like the "application context" we
 * would see in Spring framework, or the like.
 */
export function init() : {
    store: EnhancedStore<RootState>;
    listenerMiddleware: ListenerMiddlewareInstance<RootState>;
} {
    const listenerMiddleware: ListenerMiddlewareInstance<RootState> = createListenerMiddleware();

    const store : EnhancedStore = configureStore(
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

    return {
      store,
      listenerMiddleware,
    };
}

export interface RootState {
    monolithic: MonolithicState;
}
