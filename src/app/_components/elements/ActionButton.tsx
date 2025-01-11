import React from "react";
import { ReactNode, ComponentPropsWithRef, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const button = tv({
  base: "flex items-center justify-center rounded-md px-4 py-2 font-bold text-white transition-colors focus:outline-none focus:ring-2",
  variants: {
    variant: {
      submit: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-200",
      cancel: "bg-slate-500 hover:bg-slate-600 focus:ring-slate-200",
      add: "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-200",
      delete: "bg-red-500 hover:bg-red-600 focus:ring-red-200",
      indigo: "bg-indigo-400 hover:bg-indigo-600 focus:ring-indigo-200",
      pink: "bg-pink-400 hover:bg-pink-600 focus:ring-pink-200",
    },
    width: {
      auto: "",
      stretch: "w-full",
      slim: "px-3 py-1",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    isBusy: {
      true: "cursor-wait opacity-50",
    },
  },
  defaultVariants: {
    variant: "submit",
    width: "auto",
    disabled: false,
    isBusy: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"button">, "className">,
    VariantProps<typeof button> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
}

const ActionButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { children, variant, width, disabled, isBusy, className, ...rest } =
    props;

  return (
    <button
      ref={ref}
      className={button({ variant, width, disabled, isBusy, class: className })}
      disabled={disabled || isBusy}
      {...rest}
    >
      <div>
        {isBusy && (
          <FontAwesomeIcon
            icon={faSpinner}
            className="mr-2 animate-spin animate-duration-[2000ms]"
          />
        )}
        {children}
        {isBusy && <span>中...</span>}
      </div>
    </button>
  );
});

ActionButton.displayName = "ActionButton";

export default ActionButton;
