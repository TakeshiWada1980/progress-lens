import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  children: React.ReactNode;
}

const ActionLink: React.FC<Props> = (props) => {
  const { onClick, className, children } = props;
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick(e);
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={twMerge("mx-0.5 text-blue-500 underline", className)}
    >
      {children}
    </a>
  );
};

export default ActionLink;
