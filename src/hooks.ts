import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// I don't understand how this works, but this is recommended when using Redux Toolkit with TypeScript.
// See https://redux.js.org/tutorials/typescript-quick-start
//
// (From the Redux code) Use throughout your app instead of plain `useDispatch` and `useSelector`
export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
