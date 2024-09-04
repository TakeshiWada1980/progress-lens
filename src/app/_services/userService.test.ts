import UserService from "./userService";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

const TEST_PREFIX = "TEST_";
const updateUserRoleOptionQuery = {
  include: { teacher: true, student: true, admin: true },
};

describe("UserServiceに関するテスト", () => {
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

  it("ユーザの新規作成", async () => {
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

  it("ロールの不正昇格 (STUDENT->ADMIN)", async () => {
    await expect(async () => {
      await userService.updateUserRole(
        testUserId,
        Role.ADMIN,
        updateUserRoleOptionQuery
      );
    }).rejects.toThrow(DomainRuleViolationError);
  });

  it("ロールの昇格 (STUDENT->TEACHER)", async () => {
    const user = await userService.updateUserRole(
      testUserId,
      Role.TEACHER,
      updateUserRoleOptionQuery
    );
    expect(user.role).toBe(Role.TEACHER);
    expect(user.student).not.toBeNull();
    expect(user.teacher).not.toBeNull();
    expect(user.admin).toBeNull();
  });

  it("ロールの不正降格 (TEACHER->STUDENT)", async () => {
    await expect(async () => {
      await userService.updateUserRole(
        testUserId,
        Role.STUDENT,
        updateUserRoleOptionQuery
      );
    }).rejects.toThrow(DomainRuleViolationError);
  });

  it("ロールの昇格 (TEACHER->ADMIN)", async () => {
    const user = await userService.updateUserRole(
      testUserId,
      Role.ADMIN,
      updateUserRoleOptionQuery
    );
    expect(user.role).toBe(Role.ADMIN);
    expect(user.student).not.toBeNull();
    expect(user.teacher).not.toBeNull();
    expect(user.admin).not.toBeNull();
  });

  it("ロールの不正降格 (ADMIN->TEACHER)", async () => {
    await expect(async () => {
      await userService.updateUserRole(
        testUserId,
        Role.TEACHER,
        updateUserRoleOptionQuery
      );
    }).rejects.toThrow(DomainRuleViolationError);
  });

  it("ロールの不正降格 (ADMIN->STUDENT)", async () => {
    await expect(async () => {
      await userService.updateUserRole(
        testUserId,
        Role.STUDENT,
        updateUserRoleOptionQuery
      );
    }).rejects.toThrow(DomainRuleViolationError);
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
