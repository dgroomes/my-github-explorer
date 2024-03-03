import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "./RootState";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
