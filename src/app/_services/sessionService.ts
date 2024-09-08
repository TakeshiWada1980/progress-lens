import { LearningSession, PrismaClient } from "@prisma/client";
import { Prisma as PRS, Role } from "@prisma/client";
import {
  DomainRuleViolationError,
  withErrorHandling,
} from "@/app/_services/servicesExceptions";
import QuestionService from "@/app/_services/questionService";

export type SessionReturnType<
  T extends PRS.LearningSessionInclude,
  U extends PRS.LearningSessionSelect
> = {
  include?: T;
  select?: U;
};

export const fullSessionSchema = {
  include: {
    questions: {
      include: {
        options: true,
      },
    },
  },
} as const;

type CreateSessionReturnType = PRS.LearningSessionGetPayload<
  typeof fullSessionSchema
>;

// LearningSessionのCRUD操作を行なうクラス
class SessionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Idによるラーニングセッション（単数）の取得。該当なしは例外をスロー
  @withErrorHandling()
  public async getById<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    sessionId: string,
    options?: SessionReturnType<T, U>
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>> {
    return (await this.prisma.learningSession.findUniqueOrThrow({
      where: { id: sessionId },
      ...options,
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>;
  }

  // すべてのラーニングセッションの取得（Admin用途）
  @withErrorHandling()
  public async getAll<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    options?: SessionReturnType<T, U>,
    sortKey: "updatedAt" | "title" = "updatedAt",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>[]> {
    return (await this.prisma.learningSession.findMany({
      orderBy: { [sortKey]: sortDirection },
      ...options,
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>[];
  }

  // 指定IDの [教員] が作成した LS の取得
  @withErrorHandling()
  public async getAllByTeacherId<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    teacherId: string,
    options?: SessionReturnType<T, U>,
    sortKey: "updatedAt" | "title" = "updatedAt",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>[]> {
    return (await this.prisma.learningSession.findMany({
      where: { teacherId },
      orderBy: { [sortKey]: sortDirection },
      ...options,
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>[];
  }

  // 指定IDの [学生] が参加している LS の取得
  @withErrorHandling()
  public async getAllByStudentId<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    studentId: string,
    options?: SessionReturnType<T, U>,
    sortKey: "updatedAt" | "title" = "updatedAt",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>[]> {
    return (await this.prisma.learningSession.findMany({
      where: {
        enrollments: {
          some: {
            studentId: studentId,
          },
        },
      },
      orderBy: { [sortKey]: sortDirection },
      ...options,
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>[];
  }

  // ラーニングセッションの名前の変更
  @withErrorHandling()
  public async updateTitle(sessionId: string, title: string): Promise<void> {
    try {
      await this.prisma.learningSession.update({
        where: { id: sessionId },
        data: { title },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new DomainRuleViolationError(
          "指定IDのラーニングセッションが存在せず、名前の変更に失敗しました",
          { sessionId, title }
        );
      }
      throw error;
    }
  }

  // ラーニングセッションの新規作成と初期化
  @withErrorHandling()
  public async create(
    teacherId: string,
    title: string,
    accessCode: string
  ): Promise<CreateSessionReturnType> {
    // 1. セッションの作成
    let session: LearningSession | null;
    try {
      session = await this.prisma.learningSession.create({
        data: {
          teacherId,
          accessCode,
          title,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new DomainRuleViolationError(
          `Unique constraint failed on the accessCode ${accessCode}`,
          { teacherId, title, accessCode }
        );
      } else if (error.code === "P2003") {
        throw new DomainRuleViolationError(
          `FK constraint failed on the teacherId ${teacherId}`,
          { teacherId, title, accessCode }
        );
      }
      throw error;
    }

    // 2. 設問の作成
    const questionService = new QuestionService(this.prisma);
    await questionService.createQuestion(session.id);

    // 3. 設問と選択肢を含めた完全なセッション情報の再取得
    return (await this.getById(
      session.id,
      fullSessionSchema
    )) as CreateSessionReturnType;
  }

  // ラーニングセッションに参加する学生の登録
  @withErrorHandling()
  public async enrollStudent(
    sessionId: string,
    studentId: string
  ): Promise<void> {
    await this.prisma.sessionEnrollment.create({
      data: {
        sessionId,
        studentId,
      },
    });
  }

  // ラーニングセッションの削除
  @withErrorHandling()
  public async delete(sessionId: string): Promise<void> {
    await this.prisma.learningSession.delete({
      where: { id: sessionId },
    });
  }
}

export default SessionService;
