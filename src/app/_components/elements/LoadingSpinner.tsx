import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = "読み込み中..." }) => (
  <div className="text-gray-500">
    <FontAwesomeIcon
      icon={faSpinner}
      className="mr-2 animate-spin animate-duration-[2000ms]"
    />
    {message}
  </div>
);

export default LoadingSpinner;
