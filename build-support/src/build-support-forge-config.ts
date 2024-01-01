import type {ForgeConfig} from "@electron-forge/shared-types";
import {MakerDMG} from "@electron-forge/maker-dmg";
import {BuildSupportForgePlugin} from "./BuildSupportForgePlugin";

// noinspection JSUnusedGlobalSymbols
export const forgeConfig: ForgeConfig = {
    packagerConfig: {
        asar: true,
        // See https://github.com/dgroomes/electron-playground/blob/d40514c2f90ac847573c02e5c90e790a4f65cb86/realistic/build-support/src/build-support-forge-config.ts#L18
        ignore: (path: string) => {
            if (path === "") return false;

            const partOfBundle = path.startsWith("/.webpack/");
            if (partOfBundle) return false;

            const isBundle = path === "/.webpack";
            if (isBundle) return false;

            return path !== "/package.json";
        }
    },
    rebuildConfig: {},
    makers: [new MakerDMG()],
    plugins: [
        new BuildSupportForgePlugin(),
    ],
};
