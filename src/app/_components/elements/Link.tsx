import NextLink from "next/link";
import { tv, type VariantProps } from "tailwind-variants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";

// TODO: hover時のスタイルを追加
export const link = tv({
  base: "",
  variants: {
    style: {
      inline: "mx-0.5 text-blue-500 underline",
      nav: "",
      unstyled: "",
    },
    state: {
      enabled: "",
      disabled: "cursor-default text-gray-400",
      notImplemented: "cursor-pointer",
    },
  },
  compoundVariants: [
    {
      style: "inline",
      state: "disabled",
      class: "no-underline",
    },
    {
      style: "inline",
      state: "notImplemented",
      class: "text-gray-400",
    },
    {
      style: "nav",
      state: "notImplemented",
      class: "text-gray-400",
    },
  ],
  defaultVariants: {
    style: "inline",
    state: "enabled",
  },
});

interface Props extends VariantProps<typeof link> {
  href: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

const Link: React.FC<Props> = ({
  style,
  state,
  href,
  className,
  children,
  label,
}) => {
  const content = (
    <span className={link({ style, state, class: className })}>
      {children}
      {label}
    </span>
  );

  if (state && state !== "enabled") {
    const wrappedContent =
      state === "notImplemented" ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent className="bg-slate-700 text-white">
              <p>
                <FontAwesomeIcon icon={faPersonDigging} className="mr-1" />
                未実装です。
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        content
      );
    return wrappedContent;
  }

  return (
    <NextLink
      href={href}
      className={link({ style, state: state, class: className })}
    >
      {children}
      {label}
    </NextLink>
  );
};

export default Link;
