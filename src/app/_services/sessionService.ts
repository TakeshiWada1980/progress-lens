import { LearningSession, PrismaClient } from "@prisma/client";
import { Prisma as PRS } from "@prisma/client";
import {
  DomainRuleViolationError,
  withErrorHandling,
} from "@/app/_services/servicesExceptions";
import QuestionService from "@/app/_services/questionService";
import { type UpdateSessionRequest } from "@/app/_types/SessionTypes";

///////////////////////////////////////////////////////////////

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

export const forGetAllByTeacherIdSchema = {
  include: {
    enrollments: true,
    questions: true,
  },
} as const;

export const forGetAllByStudentIdSchema = {
  include: {
    enrollments: true,
    questions: true,
    teacher: {
      include: {
        user: true,
      },
    },
  },
} as const;

///////////////////////////////////////////////////////////////

type CreateSessionReturnType = PRS.LearningSessionGetPayload<
  typeof fullSessionSchema
>;

///////////////////////////////////////////////////////////////

// LearningSessionのCRUD操作を行なうクラス
class SessionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ユニークなアクセスコードの生成
  @withErrorHandling()
  private async generateAccessCode(): Promise<string> {
    const batchSize = 5; // 1試行で生成するアクセスコード候補数
    const generateDigits = (length: number): string =>
      Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

    while (true) {
      // アクセスコードの候補を生成
      const generatedCodes = new Set<string>();
      while (generatedCodes.size < batchSize) {
        generatedCodes.add(`${generateDigits(3)}-${generateDigits(4)}`);
      }
      // 既に使用されているコードを取得
      const existingCodes = await this.prisma.learningSession.findMany({
        where: {
          accessCode: {
            in: Array.from(generatedCodes),
          },
        },
        select: {
          accessCode: true,
        },
      });

      // 既存のコードを除外
      const existingCodesSet = new Set(
        existingCodes.map((code) => code.accessCode)
      );
      const availableCodes = Array.from(generatedCodes).filter(
        (code) => !existingCodesSet.has(code)
      );

      // 利用可能なコードがあればそのうちの1つを返す
      if (availableCodes.length > 0) {
        return availableCodes[0];
      }
      // 利用可能なコードがない場合は再試行
    }
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

  // 基本情報（title,isActive）の更新 セッションの存在は確認済みであること
  @withErrorHandling()
  public async update(
    sessionId: string,
    data: UpdateSessionRequest
  ): Promise<void> {
    await this.prisma.learningSession.update({
      where: { id: sessionId },
      data: { ...data },
    });
  }

  /**
   * 名前（title属性）の更新
   * @deprecated Use update() instead.
   * @see update
   */
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

  // 新規作成と初期化（設問１個付き）
  @withErrorHandling()
  public async create(
    teacherId: string,
    title: string
  ): Promise<CreateSessionReturnType> {
    let session: LearningSession | null = null;
    const accessCode = await this.generateAccessCode();
    // トランザクション内でセッションと初期設問を作成
    await this.prisma.$transaction(
      async (tx) => {
        // 1. セッションの作成
        try {
          session = await tx.learningSession.create({
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
        const questionService = new QuestionService(tx);
        await questionService.createQuestion(session.id);
      },
      { timeout: 5000 }
    );

    // 3. 設問と選択肢を含めた完全なセッション情報の再取得
    return (await this.getById(
      session!.id,
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
