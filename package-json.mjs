/*
This script generates the `package.json` files for this project. Run it with `node package-json.mjs`.
*/

import fs from "fs";

const versions = {
    antd: "~5.12.6", // Ant Design releases: https://github.com/ant-design/ant-design/releases
    cssLoader: "~6.8.1", // css-loader releases: https://github.com/webpack-contrib/css-loader/releases
    electron: "~28.1.0", // Electron releases: https://releases.electronjs.org/releases/stable
    electronForge: "~7.2.0", // Electron Forge releases: https://github.com/electron/forge/releases
    graphiql: "~3.0.10", // GraphiQL releases: https://github.com/graphql/graphiql/releases
    graphql: "~16.8.1", // GraphQL releases: https://github.com/graphql/graphql-js/releases
    graphqlWs: "~5.14.3", // graphql-ws releases: https://github.com/enisdenjo/graphql-ws/releases
    htmlWebpackPlugin: "~5.6.0", // html-webpack-plugin releases: https://github.com/jantimon/html-webpack-plugin/blob/main/CHANGELOG.md
    prettier: "~3.1.1", // Prettier releases: https://github.com/prettier/prettier/releases
    react: "~18.2.0", // React releases: https://legacy.reactjs.org/versions
    reactDomTypes: "~18.2.18", // @types/react-dom releases: https://www.npmjs.com/package/@types/react-dom?activeTab=versions
    reactRedux: "~8.1.2", // React Redux releases: https://github.com/reduxjs/react-redux/releases
    reactTypes: "~18.2.46", // @types/react releases: https://www.npmjs.com/package/@types/react?activeTab=versions
    reduxDevToolsRemote: "0.8.2", // Redux DevTools releases: https://github.com/reduxjs/redux-devtools/releases

    // We're sticking with RTK v1. While the v2 release is exciting, the "remote" package of Redux DevTools hasn't been
    // updated to support v2 yet.
    reduxToolkit: "~1.9.7", // Redux Toolkit releases: https://github.com/reduxjs/redux-toolkit/releases

    styleLoader: "~3.3.3", // style-loader releases: https://github.com/webpack-contrib/style-loader/releases
    tsLoader: "~9.5.1", // ts-loader releases: https://github.com/TypeStrong/ts-loader/releases
    typescript: "~5.3", // TypeScript releases: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
    webpackDevServer: "~4.15.1", // webpack-dev-server releases: https://github.com/webpack/webpack-dev-server/releases
};

/**
 * Generate a 'package.json' file.
 *
 * @param directory The directory to write the 'package.json' file to.
 * @param dryRun If true, the 'package.json' file will not be written.
 * @param packageJsonContent The content of the 'package.json' file, as a JavaScript object.
 */
function generatePackageJson(directory, dryRun, packageJsonContent) {
    const packageJsonString = JSON.stringify(packageJsonContent, null, 2) + "\n";
    const path = directory + "/package.json";

    console.log(`Writing 'package.json' file to '${path}'...`);
    if (dryRun) {
        console.log("DRY RUN. File not written.");
        return;
    }

    fs.writeFile(path, packageJsonString, (err) => {
        if (err) throw new Error(`Failed to write 'package.json' file to '${path}': ${err}`);
    });
}

generatePackageJson(".", false, {
    name: "my-github-explorer",
    version: "1.0.0",
    main: ".webpack/main",
    scripts: {
        start: "DEBUG=true electron-forge start",

        // Start the app in a configuration that will connect to the standalone React Developer Tools server and the
        // Redux DevTools servers. You must have already started these dev tools servers app before running this command.
        // See the README for more information.
        "start:with-devtools": "MY_GITHUB_EXPLORER_WITH_DEVTOOLS=true electron-forge start",

        package: "DEBUG=true electron-forge package",
        make: "electron-forge make",

        // Use Prettier to format the source code. I only care about formatting JS/TS code and not my HTML/CSS files.
        // Also, we're going to cross over into the 'build-support' code and format it too. I don't want to bother
        // setting up a separate Prettier config and step for that code.
        format: "prettier --write 'src/**/*.{ts,tsx}' 'build-support/src/**/*.ts'",
    },
    license: "UNLICENSED",
    dependencies: {
        "antd": versions.antd,
        "graphiql": versions.graphiql,
        "graphql": versions.graphql,
        // This shouldn't be necessary but see this issue https://github.com/graphql/graphiql/issues/2405 When I upgrade
        // to latest versions across the board, revisit this issue.
        "graphql-ws": versions.graphqlWs,
        "react": versions.react,
        "react-dom": versions.react,
        "react-redux": versions.reactRedux,
        "@redux-devtools/remote": versions.reduxDevToolsRemote,
        "@reduxjs/toolkit": versions.reduxToolkit,
    },
    devDependencies: {
        "@types/react": versions.reactTypes,
        "@types/react-dom": versions.reactDomTypes,
        // WORKAROUND. See https://github.com/dgroomes/electron-playground/blob/d40514c2f90ac847573c02e5c90e790a4f65cb86/realistic/package-json.mjs#L91
        electron: versions.electron,
        "my-github-explorer_build-support": "file:build-support/my-github-explorer_build-support-1.0.0.tgz",
        "prettier": versions.prettier
    },
});

generatePackageJson("build-support", false, {
    name: "my-github-explorer_build-support",
    version: "1.0.0",
    private: true,
    exports: {
        "./plugin": "./dist/BuildSupportForgePlugin.js",
        "./config": "./dist/build-support-forge-config.js"
    },
    scripts: {
        build: "tsc",
    },
    devDependencies: {
        typescript: versions.typescript
    },
    dependencies: {
        "@electron-forge/cli": versions.electronForge,
        "@electron-forge/maker-dmg": versions.electronForge,
        "css-loader": versions.cssLoader,
        electron: versions.electron,
        "html-webpack-plugin": versions.htmlWebpackPlugin,
        "style-loader": versions.styleLoader,
        "ts-loader": versions.tsLoader,
        "webpack-dev-server": versions.webpackDevServer,
    },
});
