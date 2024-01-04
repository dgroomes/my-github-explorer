import fs from "fs";
import path from "path";
import { app } from "electron";
import { safeStorage } from "electron";

const keyPath = path.join(app.getPath("userData"), "pat");

/**
 * Read the GitHub personal access token from the encrypted file.
 *
 * @returns {Promise<string | null>} The personal access token, or null if it doesn't exist.
 */
export async function getPersonalAccessToken(): Promise<string | null> {
  let encryptedToken: Buffer;
  try {
    encryptedToken = await fs.promises.readFile(keyPath);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log(
        "The GitHub personal access token file does not exist. This is normal if the user has never entered a token before or if it was cleared.",
      );
      return null;
    }

    throw new Error("Unexpected error while reading the GitHub personal access token from file:", { cause: e });
  }
  return safeStorage.decryptString(encryptedToken);
}

export async function savePersonalAccessToken(token: string) {
  const encryptedToken = safeStorage.encryptString(token);
  try {
    await fs.promises.writeFile(keyPath, encryptedToken);
  } catch (e) {
    throw new Error("Unexpected error while writing the GitHub personal access token to file:", { cause: e });
  }
}
