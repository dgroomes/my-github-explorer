import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger } from "./log";
import {Token} from "./token";

export interface TokenState {
  token: Token;
  shouldStoreAfterValidation: boolean;
}

const initialState: TokenState = {
  token: "init",
  shouldStoreAfterValidation: false,
};

export const TokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    /**
     * This is an idempotent action. If the token is already in the process of being restored or has fully restored,
     * then this action does nothing.
     * @param state
     */
    restoreToken(state) {
      const log = logger("restoreToken");

      if (state.token === "init") {
        log("The token was in the initial state. It will be set to 'restoring'.");
        state.token = "restoring";
      } else {
        log("The token was already in the process of being restored or has fully restored.");
      }
    },
    setToken(state, action: PayloadAction<Token>) {
      state.token = action.payload;
    },
    setShouldStoreAfterValidation(state, action: PayloadAction<boolean>) {
      state.shouldStoreAfterValidation = action.payload;
    },
  },
});
