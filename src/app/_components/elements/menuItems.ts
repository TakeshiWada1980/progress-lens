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
    label: "セッション一覧",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "設定",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];

export const guestStudentMenuItems: MenuItem[] = [
  {
    label: "セッション一覧",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "設定（ゲストは利用不可）",
    href: "#",
    state: "disabled",
    icon: faAddressCard,
  },
];

export const teacherMenuItems: MenuItem[] = [
  {
    label: "セッション一覧（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション一覧（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "設定",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];

export const guestTeacherMenuItems: MenuItem[] = [
  {
    label: "セッション一覧（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション一覧（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "設定（ゲストは利用不可）",
    href: "#",
    state: "disabled",
    icon: faAddressCard,
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    label: "セッション一覧（教員ロール）",
    href: "/teacher/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "セッション一覧（学生ロール）",
    href: "/student/sessions",
    state: "enabled",
    icon: faChalkboardUser,
  },
  {
    label: "ロール昇格処理",
    href: "/admin/assign-role",
    state: "enabled",
    icon: faUserGear,
  },
  {
    label: "設定",
    href: "/user/profile",
    state: "enabled",
    icon: faAddressCard,
  },
];
