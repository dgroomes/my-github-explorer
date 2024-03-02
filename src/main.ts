import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { getPersonalAccessToken, savePersonalAccessToken } from "./github-personal-access-token";
import { ipcMain } from "electron";
import {logger} from "./code";

// This allows TypeScript to be aware of the magic constants that are created by webpack DefinePlugin
// that tells the Electron app where to look for the Webpack-bundled app code (depending on whether you're running in
// development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const log = logger("main");

if (!process.stdout.isTTY) {
  const logsFile = path.join(app.getPath("logs"), "main.log");
  log("Redirecting standard output and standard error to", logsFile);
  const writeStream = fs.createWriteStream(logsFile);
  process.stdout.write = process.stderr.write = writeStream.write.bind(writeStream);
}

log("Hello from main.ts!");

app.on("ready", async function onReady() {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
});

ipcMain.handle("get-personal-access-token", (_event) => getPersonalAccessToken());
ipcMain.handle("save-personal-access-token", (_event, token: string) => savePersonalAccessToken(token));
