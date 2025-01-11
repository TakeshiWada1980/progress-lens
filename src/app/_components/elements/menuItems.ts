import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { type VariantProps } from "tailwind-variants";
import { link } from "@/app/_components/elements/Link";
import {
  faAddressCard,
  faPersonDigging,
  faRightFromBracket,
  faPersonChalkboard,
  faUserGear,
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
    label: "セッション",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];

export const guestStudentMenuItems: MenuItem[] = [
  {
    label: "セッション",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "アカウント（ゲストは利用不可）",
    href: "#",
    state: "disabled",
    icon: faAddressCard,
  },
];

export const teacherMenuItems: MenuItem[] = [
  {
    label: "セッション（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];

export const guestTeacherMenuItems: MenuItem[] = [
  {
    label: "セッション（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "アカウント（ゲストは利用不可）",
    href: "#",
    state: "disabled",
    icon: faAddressCard,
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    label: "セッション（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "ロール昇格",
    href: "/admin/assign-role",
    state: "enabled",
    icon: faUserGear,
  },
  {
    label: "アカウント",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];
