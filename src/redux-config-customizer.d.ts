// The 'redux-config-customizer' module is defined at build time from either 'redux-config-customizer-with-dev-tools.ts'
// or 'redux-config-customizer-without-dev-tools.ts'. At authoring time (like when editing in the IDE), the TypeScript
// compiler will complain that the package doesn't exist. Thankfully, we can fix this by creating a declaration file.
//
// redux-config-customizer.d.ts
declare module "redux-config-customizer" {
  import { ConfigureStoreOptions } from "@reduxjs/toolkit";

  export function customizeWebpackConfigForDevelopment(options: ConfigureStoreOptions): ConfigureStoreOptions;
}
