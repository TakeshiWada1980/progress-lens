import { useState, useEffect, useCallback } from "react";

const HEADER_VISIBILITY_THRESHOLD = 100;

export const useHeaderVisibility = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  const updateHeaderVisibility = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsVisible(
      currentScrollY < lastScrollY ||
        currentScrollY <= HEADER_VISIBILITY_THRESHOLD
    );
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    const handleScroll = () =>
      window.requestAnimationFrame(updateHeaderVisibility);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateHeaderVisibility]);

  return isVisible;
};
