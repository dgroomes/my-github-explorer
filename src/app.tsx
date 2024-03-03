import "./style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { MainElement } from "./MainElement";
import { Provider } from "react-redux";
import { store, listenerMiddleware } from "./store";
import {registerListeners } from "./listeners";

registerListeners(listenerMiddleware);

const root = document.getElementById("root")!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <MainElement />
    </Provider>
  </React.StrictMode>,
);
