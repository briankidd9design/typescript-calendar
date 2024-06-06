import { useContext } from "react";
import { Context } from "./Events";
export const EVENT_COLORS = ["red", "green", "blue"] as const;
export function useEvents() {
  // This function is always going to return to us an EventsContext because it takes care of the null version with the conditional
  const value = useContext(Context);
  if (value == null) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return value;
}
