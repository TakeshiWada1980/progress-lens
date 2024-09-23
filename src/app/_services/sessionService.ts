import { LearningSession, PrismaClient } from "@prisma/client";
import { Prisma as PRS } from "@prisma/client";
import {
  DomainRuleViolationError,
  withErrorHandling,
} from "@/app/_services/servicesExceptions";
import { BadRequestError } from "@/app/api/_helpers/apiExceptions";
import QuestionService, {
  forEditQuestionSchema,
} from "@/app/_services/questionService";
import {
  type UpdateSessionRequest,
  isAccessCode,
} from "@/app/_types/SessionTypes";
import AppErrorCode from "@/app/_types/AppErrorCode";

///////////////////////////////////////////////////////////////

export type SessionReturnType<
  T extends PRS.LearningSessionInclude,
  U extends PRS.LearningSessionSelect
> = {
  include?: T;
  select?: U;
  orderBy?:
    | PRS.LearningSessionOrderByWithRelationInput
    | PRS.LearningSessionOrderByWithRelationInput[];
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
  select: {
    id: true,
    title: true,
    accessCode: true,
    isActive: true,
    updatedAt: true,
    createdAt: true,
    _count: {
      select: {
        enrollments: true,
        questions: true,
      },
    },
  },
} as const;

export const forGetAllByStudentIdSchema = {
  select: {
    id: true,
    title: true,
    accessCode: true,
    isActive: true,
    updatedAt: true,
    createdAt: true,
    teacher: {
      include: {
        user: true,
      },
    },
    _count: {
      select: {
        enrollments: true,
        questions: true,
      },
    },
  },
} as const;

export const forEditSessionSchema = {
  select: {
    id: true,
    title: true,
    accessCode: true,
    isActive: true,
    teacherId: true,
    questions: {
      select: forEditQuestionSchema.select,
      orderBy: forEditQuestionSchema.orderBy,
    },
  },
} as const;

///////////////////////////////////////////////////////////////

export type PaginationOptions = {
  page: number;
  pageSize: number;
};

export type Pagination = {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
};

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
        if (!isAccessCode(availableCodes[0])) {
          throw new DomainRuleViolationError(
            "アクセスコードの生成で問題が発生しました。既定のパータンに合致しません。",
            { accessCode: availableCodes[0] }
          );
        }
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
    // findUnique などの単数検索のときに orderBy を指定するとエラーになるので除外する処理
    const { include, select } = options || {};
    return (await this.prisma.learningSession.findUniqueOrThrow({
      where: { id: sessionId },
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>;
  }

  // AccessCode によるラーニングセッション（単数）の取得。該当なしは例外をスロー
  @withErrorHandling()
  public async getByAccessCode<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    accessCode: string,
    options?: SessionReturnType<T, U>
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>> {
    const { include, select } = options || {};
    const session = await this.prisma.learningSession.findUnique({
      where: { accessCode },
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    });
    if (!session) {
      const err = new BadRequestError(`Session (${accessCode}) not found.`, {
        accessCode,
      });
      err.appErrorCode = AppErrorCode.SESSION_NOT_FOUND;
      throw err;
    }
    return session as PRS.LearningSessionGetPayload<{ include: T; select: U }>;
  }

  // すべてのラーニングセッションの取得（Admin用途）
  @withErrorHandling()
  public async getAll<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    options?: SessionReturnType<T, U>,
    sortKey: "updatedAt" | "title" = "updatedAt",
    sortDirection: "asc" | "desc" = "desc",
    paginationOptions?: PaginationOptions
  ): Promise<{
    sessions: PRS.LearningSessionGetPayload<{ include: T; select: U }>[];
    pagination?: Pagination;
  }> {
    // クエリオプションの構築
    const queryOptions: any = {
      orderBy: { [sortKey]: sortDirection },
      ...options,
    };
    if (paginationOptions) {
      const { page, pageSize } = paginationOptions;
      queryOptions.skip = (page - 1) * pageSize;
      queryOptions.take = pageSize;
    }

    // データの取得
    const sessions = await this.prisma.learningSession.findMany(queryOptions);
    const result: any = {
      sessions: sessions as PRS.LearningSessionGetPayload<{
        include: T;
        select: U;
      }>[],
    };

    // ページ情報の取得
    if (paginationOptions) {
      const total = await this.prisma.learningSession.count();
      const pagination: Pagination = {
        total,
        pageSize: paginationOptions.pageSize,
        currentPage: paginationOptions.page,
        totalPages: Math.ceil(total / paginationOptions.pageSize),
      };
      result.pagination = pagination;
    }

    return result;
  }

  // 指定IDの [教員] が作成した LS の取得
  @withErrorHandling()
  public async getAllByTeacherId<
    T extends PRS.LearningSessionInclude,
    U extends PRS.LearningSessionSelect
  >(
    teacherId: string,
    options?: SessionReturnType<T, U>,
    sortKey: "updatedAt" | "createdAt" | "title" = "updatedAt",
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
    sortKey: "updatedAt" | "createdAt" | "title" = "updatedAt",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PRS.LearningSessionGetPayload<{ include: T; select: U }>[]> {
    return (await this.prisma.learningSession.findMany({
      where: {
        enrollments: {
          some: {
            studentId: studentId,
            deletedAt: null,
          },
        },
      },
      orderBy: { [sortKey]: sortDirection },
      ...options,
    })) as PRS.LearningSessionGetPayload<{ include: T; select: U }>[];
  }

  /**
   * ラーニングセッションの基本情報（title,isActive）の更新
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param data バリデーション済みの更新データ
   * @note dataに id が含まれていても内部処理で無視するので問題ない
   */
  @withErrorHandling()
  public async update(
    sessionId: string,
    data: UpdateSessionRequest
  ): Promise<void> {
    const { id, ...updateData } = data; // id は更新させない
    await this.prisma.learningSession.update({
      where: { id: sessionId },
      data: { ...updateData },
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

    // ※トランザクションを構成したほうがよいが
    // SessionService と QuestionService にまたがる
    // トランザクションは極めて複雑なため、ここではシンプルな実装としている

    // 1. セッションの作成
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
    await questionService.create(session.id);

    // 3. 設問と選択肢を含めた完全なセッション情報の再取得
    return (await this.getById(
      session!.id,
      fullSessionSchema
    )) as CreateSessionReturnType;
  }

  /**
   * ラーニングセッションに学生を参加登録する
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param studentId 呼び出し元で有効性を保証すべきユーザーID
   * @note セッションについては isActive が True であることも事前に確認しておくこと
   * @note 重複登録には事前確認不要（upsertで対応）
   */
  @withErrorHandling()
  public async enrollStudent(
    sessionId: string,
    studentId: string
  ): Promise<void> {
    await this.prisma.sessionEnrollment.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
      create: {
        sessionId,
        studentId,
        deletedAt: null,
      },
      update: {
        deletedAt: null,
      },
    });
  }

  /**
   * ラーニングセッションに学生が参加登録されているかを確認する
   * @param sessionId 呼び出し元で有効性を【保証不要】のセッションID
   * @param studentId 呼び出し元で有効性を【保証不要】のユーザーID
   */
  @withErrorHandling()
  public async isStudentEnrolled(
    sessionId: string,
    studentId: string
  ): Promise<boolean> {
    const enrollment = await this.prisma.sessionEnrollment.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });
    return !!enrollment && !enrollment.deletedAt;
  }

  /**
   * ラーニングセッションの参加登録を解除する
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param studentId 呼び出し元で有効性を保証すべきユーザーID
   * @note 事前に sessionEnrollment にレコードが存在することを確認しておくこと
   * @note 実際の削除はせずに isDeleted フラグの更新するだけ。
   */
  @withErrorHandling()
  public async unenrollStudent(
    sessionId: string,
    studentId: string
  ): Promise<void> {
    await this.prisma.sessionEnrollment.update({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
      data: {
        deletedAt: new Date(),
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
