import { useRef, useCallback } from "react";

export const useRenderCount = () => {
  const count = useRef(0);

  const increment = useCallback(() => {
    count.current += 1;
  }, []);

  const reset = useCallback(() => {
    count.current = 0;
  }, []);

  increment();

  return {
    renderCount: count.current,
    resetRenderCount: reset,
  };
};
