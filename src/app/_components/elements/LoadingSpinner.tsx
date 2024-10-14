import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

interface Props {
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<Props> = ({
  message = "読み込み中...",
  className,
}) => (
  <div className="text-gray-500">
    <FontAwesomeIcon
      icon={faSpinner}
      className={twMerge(
        "mr-2 animate-spin animate-duration-[2000ms]",
        className
      )}
    />
    {message}
  </div>
);

export default LoadingSpinner;
