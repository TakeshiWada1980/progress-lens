import { useCallback } from "react";

export const INPUT_CANCELLED = "INPUT_CANCELLED!";
type InputElement = HTMLInputElement | HTMLTextAreaElement;

export const useExitInputOnEnter = () => {
  const exitInputOnEnter = useCallback(
    (e: React.KeyboardEvent<InputElement>) => {
      if (e.currentTarget instanceof HTMLInputElement && e.key === "Enter") {
        e.currentTarget.blur();
        return;
      }

      if (
        e.currentTarget instanceof HTMLTextAreaElement &&
        e.key === "Enter" &&
        e.ctrlKey
      ) {
        e.currentTarget.blur();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.currentTarget.value = INPUT_CANCELLED;
        e.currentTarget.blur();
      }
    },
    []
  );

  return exitInputOnEnter;
};
