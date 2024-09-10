import UserService from "./userService";
import SessionService, { fullSessionSchema } from "./sessionService";
import { Prisma as PRS } from "@prisma/client";
import { Role } from "@/app/_types/UserTypes";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { optionSetSize } from "@/config/app-config";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

describe("LearningSessionServiceのテスト", () => {
  let prisma: PrismaClient;
  let teacherId: string;
  let sessionId: string;
  let userService: UserService;
  let sessionService: SessionService;

  const seeds = Array.from({ length: 3 }, (_, i) => ({
    title: `セッション-${uuidv4().substring(0, 8)}`,
    accessCode: "",
  }));

  beforeAll(async () => {
    teacherId = `TEST-${uuidv4().substring(0, 8)}`;
    prisma = new PrismaClient();
    userService = new UserService(prisma);
    sessionService = new SessionService(prisma);
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: teacherId,
      },
    });
    await prisma.$disconnect();
  });

  describe("教員ロールのテストユーザの作成", () => {
    it("成功する", async () => {
      await userService.createAsStudent(teacherId, "不具合 直志");
      const teacher = await userService.updateRole(teacherId, Role.TEACHER);
      expect(teacher.role).toBe(Role.TEACHER);
    });
  });

  describe("ラーニングセッション（LS）の新規作成", () => {
    it("成功する", async () => {
      const seed = seeds[0];
      const session = await sessionService.create(teacherId, seed.title);
      sessionId = session.id;
      seed.accessCode = session.accessCode;
      const question = session.questions[0];

      // 1つの設問が作成されていること
      expect(session.questions.length).toBe(1);

      // 設問はoptionSetSize(6個)の選択肢を持っていること
      expect(question.options.length).toBe(optionSetSize);

      // 設問のデフォルト選択肢が、最初の選択肢になっていること
      expect(question.defaultOptionId).toBe(question.options[0].id);

      // console.log(JSON.stringify(session, null, 2));
    });
  });

  describe("LSのIdによる取得", () => {
    it("成功する", async () => {
      const session = (await sessionService.getById(
        sessionId,
        fullSessionSchema
      )) as PRS.LearningSessionGetPayload<typeof fullSessionSchema>;

      // const session = await sessionService.getById(sessionId);

      expect(session).not.toBe(null);
      // console.log(JSON.stringify(session, null, 2));
    });
  });

  describe("存在しないUserIdを引数にLSの新規作成", () => {
    it("失敗する", async () => {
      await expect(
        sessionService.create("hoge", seeds[1].title)
      ).rejects.toThrow(DomainRuleViolationError);
    });
  });

  describe(`LSの追加作成（${seeds.length - 1}個）`, () => {
    it("成功する", async () => {
      const sessionsSeeds2 = seeds.slice(1); // 先頭を除く
      const sessions = await Promise.all(
        sessionsSeeds2.map(({ title, accessCode }) =>
          sessionService.create(teacherId, title)
        )
      );
      sessions.forEach((session, index) => {
        expect(session.title).toBe(sessionsSeeds2[index].title);
      });
    });
  });

  describe("LSの削除（設問と選択肢のカスケード削除）", () => {
    it("成功する", async () => {
      // LSの削除
      await sessionService.delete(sessionId);
      // LSに紐づいた設問が削除されていること
      const questions = await prisma.question.findMany({
        where: {
          sessionId,
        },
      });
      expect(questions.length).toBe(0);

      // LSに紐づいた設問に紐づいた選択肢も削除されていること
      const options = await prisma.option.findMany({
        where: {
          question: {
            sessionId,
          },
        },
      });
      expect(options.length).toBe(0);
    });
  });
});
