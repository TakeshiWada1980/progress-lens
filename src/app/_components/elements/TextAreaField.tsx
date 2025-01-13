"use client";

import React, { useEffect, useRef } from "react";
import { ReactNode, ComponentPropsWithRef, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const textarea = tv({
  base: "min-h-10 w-full resize-none overflow-y-hidden rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700",
  variants: {
    border: {
      normal: "border-gray-300",
      hoverOnly:
        "border-transparent bg-transparent hover:border-gray-300 focus:ring-inset",
    },
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
    border: "normal",
    disabled: false,
    isBusy: false,
    readOnly: false,
    error: false,
  },
});

interface Props
  extends Omit<ComponentPropsWithRef<"textarea">, "className">,
    VariantProps<typeof textarea> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
  readOnly?: boolean;
  error?: boolean;
  border?: "normal" | "hoverOnly";
}

const TextAreaField = forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const {
    disabled,
    className,
    readOnly,
    error,
    isBusy,
    border,
    value,
    ...rest
  } = props;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef =
    (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    const element = textareaRef.current;
    if (element && value) {
      // DOMの更新が確実に完了した後で高さを調整
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          adjustHeight(element);
        });
      });
    }
  }, [value, textareaRef]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      className={textarea({
        border,
        disabled,
        readOnly,
        error,
        class: className,
      })}
      disabled={disabled || isBusy}
      readOnly={readOnly}
      onInput={(e) => adjustHeight(e.currentTarget)}
      rows={1}
      {...rest}
    />
  );
});

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;
