import { useContext } from "react";
import { AppStateContext } from "../contextProviders/AppStateContext";

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("contect not found.");
  }
  return context;
}
