import { Role } from "@/app/_types/UserTypes";

export const roleEnum2str = (role: Role | undefined): string => {
  switch (role) {
    case Role.STUDENT:
      return "学生";
    case Role.TEACHER:
      return "教員";
    case Role.ADMIN:
      return "管理者";
    default:
      return "";
  }
};
