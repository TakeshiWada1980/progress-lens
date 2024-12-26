import { Role } from "@/app/_types/UserTypes";

const DASHBOARD_ROUTES = new Map<Role, string>([
  [Role.STUDENT, "/student/sessions"],
  [Role.TEACHER, "/teacher/sessions"],
  [Role.ADMIN, "/admin"],
]);

export const resolveDashboardPage = (role: Role) => {
  return DASHBOARD_ROUTES.get(role) ?? "/";
};
