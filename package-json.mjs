/*
This script generates the `package.json` files for this project. Run it with `node package-json.mjs`.
*/

import fs from "fs";

const versions = {
    antd: "~5.3.0", // Ant Design releases: https://github.com/ant-design/ant-design/releases
    cssLoader: "~6.8.1", // css-loader releases: https://github.com/webpack-contrib/css-loader/releases
    electron: "~27.0.4", // Electron releases: https://releases.electronjs.org/releases/stable
    electronForge: "~6.4.2", // Electron Forge releases: https://github.com/electron/forge/releases
    graphiql: "2.4.0", // GraphiQL releases: https://github.com/graphql/graphiql/releases
    graphql: "16.6.0", // GraphQL releases: https://github.com/graphql/graphql-js/releases
    graphqlWs: "^5", // graphql-ws releases: https://github.com/enisdenjo/graphql-ws/releases
    htmlWebpackPlugin: "~5.5.3", // html-webpack-plugin releases: https://github.com/jantimon/html-webpack-plugin/blob/main/CHANGELOG.md
    react: "~18.2.0", // React releases: https://legacy.reactjs.org/versions
    reactDomTypes: "~18.2.15", // @types/react-dom releases: https://www.npmjs.com/package/@types/react-dom
    reactTypes: "~18.2.37", // @types/react releases: https://www.npmjs.com/package/@types/react
    styleLoader: "~3.3.3", // style-loader releases: https://github.com/webpack-contrib/style-loader/releases
    tsLoader: "~9.5.0", // ts-loader releases: https://github.com/TypeStrong/ts-loader/releases
    typescript: "~5.2", // TypeScript releases: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
    webpackDevServer: "~4.15.1", // webpack-dev-server releases: https://github.com/webpack/webpack-dev-server/releases/tag/v4.15.1
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
    description: "A toy GitHub data explorer which I'm using to explore frontend tech like GraphiQL, React, Redux and Electron.",
    main: ".webpack/main",
    scripts: {
        start: "DEBUG=true electron-forge start",

        // Start the app in a configuration that will connect to the external/standalone React Developer Tools instance.
        // You must have already started the React Developer Tools app before running this command.
        "start:react-devtools": "MY_GITHUB_EXPLORER_CONNECT_TO_REACT_DEVTOOLS=true electron-forge start",

        package: "DEBUG=true electron-forge package",
        make: "electron-forge make",
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
    },
    devDependencies: {
        "@types/react": versions.reactTypes,
        "@types/react-dom": versions.reactDomTypes,
        // WORKAROUND. See https://github.com/dgroomes/electron-playground/blob/d40514c2f90ac847573c02e5c90e790a4f65cb86/realistic/package-json.mjs#L91
        electron: versions.electron,
        "my-github-explorer_build-support": "file:build-support/my-github-explorer_build-support-1.0.0.tgz",
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
