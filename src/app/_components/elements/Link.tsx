import NextLink from "next/link";
import { tv, type VariantProps } from "tailwind-variants";

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/shadcn/ui/tooltip";

const link = tv({
  base: "mx-0.5",
  variants: {
    variant: {
      normal: "text-blue-500 underline",
      unstyled: "",
      notImplemented: "cursor-pointer text-gray-400",
      notImplementedWithTooltip: "cursor-pointer text-gray-400",
    },
  },
  defaultVariants: {
    variant: "normal",
  },
});

interface Props extends VariantProps<typeof link> {
  href: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

const Link: React.FC<Props> = (props) => {
  const { variant, href, className, children, label } = props;

  if (variant === "notImplemented") {
    return (
      <span className={link({ variant, class: className })}>
        {children}
        {label}
      </span>
    );
  }

  if (variant === "notImplementedWithTooltip") {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={link({ variant, class: className })}>
              {children}
              {label}
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-700 text-white">
            <p>
              <FontAwesomeIcon icon={faPersonDigging} className="mr-1" />
              未実装です
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <NextLink href={href} className={link({ variant, class: className })}>
      {children}
      {label}
    </NextLink>
  );
};

export default Link;
