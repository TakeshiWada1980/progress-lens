import UserService from "./userService";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";
import { fullUserSchema } from "@/app/_services/userService";

describe("UserServiceのテスト", () => {
  let prisma: PrismaClient;
  let userId: string;
  let userService: UserService;

  beforeAll(async () => {
    userId = `TEST-${uuidv4().substring(0, 8)}`;
    prisma = new PrismaClient();
    userService = new UserService(prisma);
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await prisma.$disconnect();
  });

  describe("ユーザの新規作成", () => {
    it("StudentTableが関連付いた学生ロールのユーザが作成される", async () => {
      const testUser = {
        id: userId,
        displayName: "高負荷 耐子",
      };
      const user = await userService.createAsStudent(
        testUser.id,
        testUser.displayName
      );
      expect(user.displayName).toBe(testUser.displayName);
      expect(user.role).toBe(Role.STUDENT);
      expect(user.student).not.toBeNull();
    });
  });

  describe("ユーザのロール変更", () => {
    //
    describe("STUDENT->ADMIN（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateRole(userId, Role.ADMIN, fullUserSchema)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.getById(userId);
        expect(user.role).toBe(Role.STUDENT);
      });
    });

    describe("STUDENT->TEACHER", () => {
      it("TeacherTableが追加で関連付いた教員ロールのユーザに更新される", async () => {
        const user = await userService.updateRole(
          userId,
          Role.TEACHER,
          fullUserSchema
        );
        expect(user.role).toBe(Role.TEACHER);
        expect(user.student).not.toBeNull();
        expect(user.teacher).not.toBeNull();
        expect(user.admin).toBeNull();
      });
    });

    describe("TEACHER->STUDENT（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateRole(userId, Role.STUDENT, fullUserSchema)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.getById(userId);
        expect(user.role).toBe(Role.TEACHER);
      });
    });

    describe("TEACHER->ADMIN", () => {
      it("AdminTableが追加で関連付いた管理者ロールのユーザに更新される", async () => {
        const user = await userService.updateRole(
          userId,
          Role.ADMIN,
          fullUserSchema
        );
        expect(user.role).toBe(Role.ADMIN);
        expect(user.student).not.toBeNull();
        expect(user.teacher).not.toBeNull();
        expect(user.admin).not.toBeNull();
      });
    });

    describe("ADMIN->TEACHER（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateRole(userId, Role.TEACHER, fullUserSchema)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.getById(userId);
        expect(user.role).toBe(Role.ADMIN);
      });
    });

    describe("ADMIN->STUDENT（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateRole(userId, Role.STUDENT, fullUserSchema)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.getById(userId);
        expect(user.role).toBe(Role.ADMIN);
      });
    });
    //
  });
});
