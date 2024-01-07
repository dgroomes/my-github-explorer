import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenState } from "./code";

export interface MonolithicState {
  tokenState: TokenState;
  shouldStoreAfterValidation: boolean;
}

const initialState: MonolithicState = {
  tokenState: "restoring",
  shouldStoreAfterValidation: false,
};

export const monolithicSlice = createSlice({
  name: "monolithic",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<TokenState>) {
      state.tokenState = action.payload;
    },
    setShouldStoreAfterValidation(state, action: PayloadAction<boolean>) {
      state.shouldStoreAfterValidation = action.payload;
    },
  },
});

export const { setToken, setShouldStoreAfterValidation } = monolithicSlice.actions;

export default monolithicSlice.reducer;
