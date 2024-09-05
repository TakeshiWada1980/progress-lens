import UserService from "./userService";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

const TEST_PREFIX = "TEST_";
const updateRoleQuery = {
  include: { teacher: true, student: true, admin: true },
};

describe("UserServiceのテスト", () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let userService: UserService;

  beforeAll(async () => {
    testUserId = `${TEST_PREFIX}${uuidv4().substring(0, 8)}`;
    prisma = new PrismaClient();
    userService = new UserService(prisma);
  });

  afterAll(async () => {
    await cleanupTestUsers(prisma);
    await prisma.$disconnect();
  });

  describe("ユーザの新規作成", () => {
    it("StudentTableが関連付いた学生ロールのユーザが作成される", async () => {
      const initialUserCount = await prisma.user.count(); // 既存のユーザ数を取得

      // テストユーザの作成
      const testUser = {
        id: testUserId,
        displayName: "高負荷 耐子",
      };
      const user = await userService.createUserAsStudent(
        testUser.id,
        testUser.displayName
      );

      expect(user.displayName).toBe(testUser.displayName);
      expect(user.role).toBe(Role.STUDENT);
      expect(user.student).not.toBeNull();

      // ユーザ追加の確認
      const finalUserCount = await prisma.user.count();
      expect(finalUserCount).toBe(initialUserCount + 1);
    });
  });

  describe("ユーザのロール変更", () => {
    //
    describe("STUDENT->ADMIN（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateUserRole(testUserId, Role.ADMIN, updateRoleQuery)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.findUserById(testUserId);
        expect(user.role).toBe(Role.STUDENT);
      });
    });

    describe("STUDENT->TEACHER", () => {
      it("TeacherTableが追加で関連付いた教員ロールのユーザに更新される", async () => {
        const user = await userService.updateUserRole(
          testUserId,
          Role.TEACHER,
          updateRoleQuery
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
          userService.updateUserRole(testUserId, Role.STUDENT, updateRoleQuery)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.findUserById(testUserId);
        expect(user.role).toBe(Role.TEACHER);
      });
    });

    describe("TEACHER->ADMIN", () => {
      it("AdminTableが追加で関連付いた管理者ロールのユーザに更新される", async () => {
        const user = await userService.updateUserRole(
          testUserId,
          Role.ADMIN,
          updateRoleQuery
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
          userService.updateUserRole(testUserId, Role.TEACHER, updateRoleQuery)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.findUserById(testUserId);
        expect(user.role).toBe(Role.ADMIN);
      });
    });

    describe("ADMIN->STUDENT（不正操作）", () => {
      it("エラーになる（現在ロールが維持される）", async () => {
        await expect(
          userService.updateUserRole(testUserId, Role.STUDENT, updateRoleQuery)
        ).rejects.toThrow(DomainRuleViolationError);
        const user = await userService.findUserById(testUserId);
        expect(user.role).toBe(Role.ADMIN);
      });
    });
    //
  });
});

// テストユーザの削除
const cleanupTestUsers = async (prisma: PrismaClient) => {
  await prisma.user.deleteMany({
    where: {
      id: {
        startsWith: TEST_PREFIX,
      },
    },
  });
};
