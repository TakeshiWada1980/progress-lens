"use client";

import { useToast } from "@/app/_components/shadcn/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/app/_components/shadcn/ui/toast";
import { Check } from "lucide-react"; // Lucide Reactからチェックアイコンをインポート
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>
                  {variant === "success" && (
                    <Check className="mr-1.5 inline-block size-4" />
                    // <FontAwesomeIcon
                    //   icon={faCircleCheck}
                    //   className="mr-2 inline-block size-4"
                    // />
                  )}
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
