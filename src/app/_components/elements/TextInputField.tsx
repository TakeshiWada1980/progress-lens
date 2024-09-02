"use client";

import React from "react";
import { ReactNode, ComponentPropsWithRef, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const input = tv({
  base: "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700",
  variants: {
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    readOnly: {
      true: "cursor-default bg-gray-100 text-gray-500 focus:border-gray-300 focus:ring-0",
    },
    error: {
      true: "border-red-500 focus:border-red-500 focus:ring-red-500",
    },
  },
  defaultVariants: {
    width: "auto",
    disabled: false,
    isBusy: false,
    readOnly: false,
    error: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"input">, "className">,
    VariantProps<typeof input> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

const TextInputField = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { disabled, className, readOnly, error, isBusy, ...rest } = props;

  return (
    <input
      ref={ref}
      className={input({ disabled, readOnly, error, class: className })}
      disabled={disabled || isBusy}
      readOnly={readOnly}
      {...rest}
    />
  );
});

TextInputField.displayName = "FormTextTextInputField";

export default TextInputField;
