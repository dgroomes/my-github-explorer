export declare global {
    interface ErrorConstructor {

        /**
         * For some reason, the {@link Error} type definition doesn't include the constructor signature that takes the
         * `options` parameter. Let's add it.
         */
        new(message: string, options?: { cause?: Error }): Error;
    }
}

/**
 * We can use TypeScript types to define the API that we use across the Electron IPC boundary. The preload code can
 * code to this interface when defining the `api` object and the web page code can code to this interface when calling
 * functions on the `api` object.
 */
export interface IpcApi {
  getPersonalAccessToken: () => Promise<null | string>;
  savePersonalAccessToken: (token: string) => Promise<void>;
}

declare global {
    interface Window {

        /**
         * This is the IPC API that's exposed to the web page. I haven't bothered defining this type in a separate
         * compilation unit from the main process code or the preload script code, but in a perfect world, I might.
         */
        api: IpcApi;
    }
}
