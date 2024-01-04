import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FetchState = "untriggered" | "in-flight" | Error | { kind: "response"; status: number; json: string };

export interface MonolithicState {
  // I'm already at a challenge. I'm going to use this for 'useFetch' but technically `useFetch` deserves its own slice (?)
  // because there can be multiple fetches in the app at the same time. 'useFetch' is designed as a generic hook but forget
  // that for now. We are hard coding the workflow until we can make sense of it get more fully onto Redux.
  fetchState: FetchState;
}

const initialState: MonolithicState = {
  fetchState: "untriggered",
};

export const monolithicSlice = createSlice({
  name: "monolithic",
  initialState,
  reducers: {
    setFetchState(state, action: PayloadAction<MonolithicState["fetchState"]>) {
      state.fetchState = action.payload;
    },
  },
});

export const { setFetchState } = monolithicSlice.actions;

export default monolithicSlice.reducer;
