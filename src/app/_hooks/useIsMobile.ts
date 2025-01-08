import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDeviceType = () => {
      const mobile = window.matchMedia(
        "(max-width: 767px), (hover: none) and (pointer: coarse)"
      );
      setIsMobile(mobile.matches);
    };

    updateDeviceType();
    const mobileQuery = window.matchMedia(
      "(max-width: 767px), (hover: none) and (pointer: coarse)"
    );
    mobileQuery.addEventListener("change", updateDeviceType);

    return () => mobileQuery.removeEventListener("change", updateDeviceType);
  }, []);

  return isMobile;
};
