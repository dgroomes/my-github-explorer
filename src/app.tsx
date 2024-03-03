import "./style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { MainElement } from "./MainElement";
import { Provider } from "react-redux";
import {  RootState } from "./RootState";
import { configureStore, createListenerMiddleware, EnhancedStore, ListenerMiddlewareInstance } from "@reduxjs/toolkit";
import { customizeWebpackConfigForDevelopment } from "redux-config-customizer";
import {tokenRestoreListener, TokenSlice} from "./token";

const listenerMiddleware: ListenerMiddlewareInstance<RootState> = createListenerMiddleware();

const store: EnhancedStore = configureStore(
  customizeWebpackConfigForDevelopment({
    reducer: {
      token: TokenSlice.reducer,
    },
    // This is tricky. The listener middleware specifically has to come before the regular middleware components because
    // the listener middleware accepts non-serializable objects, but the essence of Redux is about instrumenting your
    // serialized state.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  }),
);

listenerMiddleware.startListening(tokenRestoreListener);

const root = document.getElementById("root")!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <MainElement />
    </Provider>
  </React.StrictMode>,
);
