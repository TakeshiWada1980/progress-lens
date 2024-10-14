import { useCallback } from "react";

export const INPUT_CANCELLED = "INPUT_CANCELLED!";
export const useExitInputOnEnter = () => {
  const exitInputOnEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.currentTarget.value = INPUT_CANCELLED;
        e.currentTarget.blur();
      }
    },
    []
  );

  return exitInputOnEnter;
};
