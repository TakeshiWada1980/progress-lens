import { useCallback } from "react";

export const useExitInputOnEnter = () => {
  const exitInputOnEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    []
  );

  return exitInputOnEnter;
};
