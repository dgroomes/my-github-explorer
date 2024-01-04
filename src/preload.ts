import { contextBridge, ipcRenderer } from "electron";
import { IpcApi } from "./types";

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
console.log("Hello from 'preload.ts!'");

const api: IpcApi = {
  getPersonalAccessToken: () => ipcRenderer.invoke("get-personal-access-token"),
  savePersonalAccessToken: (token: string) => ipcRenderer.invoke("save-personal-access-token", token),
};

contextBridge.exposeInMainWorld("api", api);
