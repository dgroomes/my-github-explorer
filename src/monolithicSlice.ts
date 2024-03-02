import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logger, TokenState } from "./code";

export interface MonolithicState {
  tokenState: TokenState;
  shouldStoreAfterValidation: boolean;
}

const initialState: MonolithicState = {
  tokenState: "init",
  shouldStoreAfterValidation: false,
};

export const monolithicSlice = createSlice({
  name: "monolithic",
  initialState,
  reducers: {
    /**
     * This is an idempotent action. If the token is already in the process of being restored or has fully restored,
     * then this action does nothing.
     * @param state
     */
    restoreToken(state) {
      const log = logger("restoreToken");

      if (state.tokenState === "init") {
        log("The token was in the initial state. It will be set to 'restoring'.");
        state.tokenState = "restoring";
      } else {
        log("The token was already in the process of being restored or has fully restored.");
      }
    },
    setToken(state, action: PayloadAction<TokenState>) {
      state.tokenState = action.payload;
    },
    setShouldStoreAfterValidation(state, action: PayloadAction<boolean>) {
      state.shouldStoreAfterValidation = action.payload;
    },
  },
});

export const { setToken, setShouldStoreAfterValidation, restoreToken } = monolithicSlice.actions;

export default monolithicSlice.reducer;
