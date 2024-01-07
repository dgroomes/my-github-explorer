import { ConfigureStoreOptions } from "@reduxjs/toolkit";
import { devToolsEnhancer } from "@redux-devtools/remote";

export function customizeWebpackConfigForDevelopment(config: ConfigureStoreOptions) {
  // See https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-remote and https://github.com/reduxjs/redux-toolkit/issues/66#issuecomment-459980979
  config.devTools = false;
  config.enhancers = [devToolsEnhancer({ realtime: true })];
  return config;
}
