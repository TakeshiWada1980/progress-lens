"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  value: number;
  max: number;
  animationTrigger: boolean;
  color1?: string;
  color2?: string;
};

const AnimatedProgressBar: React.FC<Props> = (props) => {
  const {
    value,
    max,
    animationTrigger,
    color1 = "bg-green-500",
    color2 = "bg-green-50",
  } = props;
  const [width, setWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    let mounted = true;

    const animate = async () => {
      if (!mounted) return;

      setIsTransitioning(false);
      setWidth(0);

      await new Promise((resolve) => setTimeout(resolve, 50));

      if (!mounted) return;

      requestAnimationFrame(() => {
        if (!mounted) return;
        setIsTransitioning(true);
        setWidth((value / max) * 100);
      });
    };

    animate();

    return () => {
      mounted = false;
    };
  }, [value, max, animationTrigger]);

  return (
    <div className="relative h-3 w-full rounded-full bg-pink-100">
      <div
        className={twMerge(
          color1,
          "absolute left-0 top-0 h-full rounded-full",
          isTransitioning && "transition-all duration-1000 ease-out"
        )}
        style={{
          width: `${width}%`,
          boxShadow:
            "inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className={twMerge(
            "absolute inset-0 animate-pulse rounded-full opacity-5 animate-duration-[5000ms] animate-ease-in",
            color2
          )}
        />
      </div>
    </div>
  );
};

export default AnimatedProgressBar;
