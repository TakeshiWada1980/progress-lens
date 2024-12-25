import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { type VariantProps } from "tailwind-variants";
import { link } from "@/app/_components/elements/Link";
import {
  faAddressCard,
  faPersonDigging,
  faRightFromBracket,
  faPersonChalkboard,
  faChalkboardUser,
} from "@fortawesome/free-solid-svg-icons";

type LinkVariants = VariantProps<typeof link>;

interface MenuItem {
  label: string;
  href: string;
  state?: LinkVariants["state"];
  icon: IconDefinition;
}

export const studentMenuItems: MenuItem[] = [
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
  {
    label: "セッション",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
];

export const teacherMenuItems: MenuItem[] = [
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
  {
    label: "セッション（教員）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション（学生）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
  {
    label: "セッション（教員）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション（学生）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "項目1 (仮)",
    href: "#",
    state: "notImplemented",
    icon: faPersonDigging,
  },
];
