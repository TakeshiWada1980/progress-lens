"use client";

import React, { useRef, useEffect } from "react";

export const RenderCount: React.FC = () => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <div className="text-xs text-rose-400">Renders: {renderCount.current}</div>
  );
};
