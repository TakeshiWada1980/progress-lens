import { PrismaClient } from "@prisma/client";
import { optionSetSize } from "@/config/app-config";
import type { Question } from "@prisma/client";
import { withErrorHandling } from "@/app/_services/servicesExceptions";
import { Prisma as PRS } from "@prisma/client";
import {
  type UpdateQuestionRequest,
  type UpdateOptionRequest,
} from "@/app/_types/SessionTypes";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

///////////////////////////////////////////////////////////////

export type QuestionReturnType<
  T extends PRS.QuestionInclude,
  U extends PRS.QuestionSelect
> = {
  include?: T;
  select?: U;
  orderBy?:
    | PRS.QuestionOrderByWithRelationInput
    | PRS.QuestionOrderByWithRelationInput[];
};

export type OptionReturnType<
  T extends PRS.OptionInclude,
  U extends PRS.OptionSelect
> = {
  include?: T;
  select?: U;
  orderBy?:
    | PRS.OptionOrderByWithRelationInput
    | PRS.OptionOrderByWithRelationInput[];
};

///////////////////////////////////////////////////////////////

export const forEditOptionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    questionId: true,
    description: true,
    rewardMessage: true,
    rewardPoint: true,
    effect: true,
  },
  orderBy: {
    order: "asc" as const,
  },
} as const;

export const forEditQuestionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    description: true,
    defaultOptionId: true,
    options: {
      select: forEditOptionSchema.select,
      orderBy: forEditOptionSchema.orderBy,
    },
  },
  orderBy: {
    order: "asc" as const,
  },
} as const;

///////////////////////////////////////////////////////////////

export const forDuplicateQuestionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    description: true,
    defaultOptionId: true,
    sessionId: true,
    options: {
      select: forEditOptionSchema.select,
      orderBy: forEditOptionSchema.orderBy,
    },
  },
  orderBy: {
    order: "asc" as const,
  },
} as const;

///////////////////////////////////////////////////////////////

export const forUpdateQuestionSchema = {
  include: {
    session: {
      select: {
        teacherId: true,
      },
    },
    options: {
      select: {
        id: true,
      },
    },
  },
} as const;

export const forUpdateOptionSchema = {
  include: {
    question: {
      select: {
        id: true,
        session: {
          select: {
            teacherId: true,
          },
        },
      },
    },
  },
} as const;

///////////////////////////////////////////////////////////////

export const forPostResponseSchema = {
  select: {
    id: true,
    sessionId: true,
    session: {
      select: {
        isActive: true,
      },
    },
    options: {
      select: {
        id: true,
        questionId: true,
      },
    },
  },
} as const;

///////////////////////////////////////////////////////////////

export const forSnapshotOptionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    questionId: true,
    description: true,
    rewardMessage: true,
    rewardPoint: true,
    effect: true,
    _count: {
      select: {
        responses: true,
      },
    },
  },
  orderBy: {
    order: "asc" as const,
  },
} as const;

export const forSnapshotQuestionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    description: true,
    defaultOptionId: true,
    // sessionId: true,
    options: {
      select: forSnapshotOptionSchema.select,
      orderBy: forSnapshotOptionSchema.orderBy,
    },
  },
  orderBy: {
    order: "asc" as const,
  },
} as const;

///////////////////////////////////////////////////////////////

class QuestionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Idによる設問（単数）の取得
   * @param id 呼び出し元で有効性を【保証不要】の設問ID
   * @param options include / selectの指定
   * @note 該当なしは例外をスロー
   */
  @withErrorHandling()
  public async getById<
    T extends PRS.QuestionInclude,
    U extends PRS.QuestionSelect
  >(
    id: string,
    options?: QuestionReturnType<T, U>
  ): Promise<PRS.QuestionGetPayload<{ include: T; select: U }>> {
    const { include, select } = options || {};
    const question = (await this.prisma.question.findUniqueOrThrow({
      where: { id: id },
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
      // ...options,
    })) as PRS.QuestionGetPayload<{ include: T; select: U }>;
    return question;
  }

  /**
   * Idによる回答選択肢（単数）の取得
   * @param id 呼び出し元で有効性を【保証不要】の回答選択肢ID
   * @param options include / selectの指定
   * @note 該当なしは例外をスロー
   */
  @withErrorHandling()
  public async getOptionById<
    T extends PRS.OptionInclude,
    U extends PRS.OptionSelect
  >(
    id: string,
    options?: OptionReturnType<T, U>
  ): Promise<PRS.OptionGetPayload<{ include: T; select: U }>> {
    const { include, select } = options || {};
    const question = (await this.prisma.option.findUniqueOrThrow({
      where: { id: id },
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
      // ...options,
    })) as PRS.OptionGetPayload<{ include: T; select: U }>;
    return question;
  }

  /**
   * 指定のoptionIdを持つ設問 (単数) を取得
   * @param optionId 呼び出し元で有効性を【保証不要】の選択肢ID
   * @note 該当なしは例外をスロー
   */
  @withErrorHandling()
  public async getByOptionId<
    T extends PRS.OptionInclude,
    U extends PRS.OptionSelect
  >(
    optionId: string,
    options?: OptionReturnType<T, U>
  ): Promise<PRS.QuestionGetPayload<{ include: T; select: U }>> {
    const { include, select } = options || {};
    const question = (await this.prisma.question.findFirstOrThrow({
      where: { options: { some: { id: optionId } } },
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    })) as PRS.QuestionGetPayload<{ include: T; select: U }>;
    return question;
  }

  /**
   * 設問の基本情報の更新
   * @param questionId 呼び出し元で有効性を保証すべきセッションID
   * @param data バリデーション済みの更新データ
   * @note dataに id を含むが、これは更新対象から除外する実装になっている
   */
  @withErrorHandling()
  public async update(
    questionId: string,
    data: UpdateQuestionRequest
  ): Promise<void> {
    const { id, ...updateData } = data; // id を除外する
    await this.prisma.question.update({
      where: { id: questionId },
      data: { ...updateData },
    });
  }

  /**
   * 回答選択肢の基本情報の更新
   * @param optionId 呼び出し元で有効性を保証すべきセッションID
   * @param data バリデーション済みの更新データ
   * @note dataに id を含むが、これは更新対象から除外する実装になっている
   */
  @withErrorHandling()
  public async updateOption(
    optionId: string,
    data: UpdateOptionRequest
  ): Promise<void> {
    const { id, ...updateData } = data; // id を除外する
    await this.prisma.option.update({
      where: { id: optionId },
      data: { ...updateData },
    });
  }

  /**
   * 設問の並び順（order）の更新
   * @param questionOrderUpdates 呼び出し元で有効性を保証したデータ
   */
  @withErrorHandling()
  public async updateOrder(
    questionOrderUpdates: {
      order: number;
      questionId: string;
    }[]
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        questionOrderUpdates.map(({ questionId, order }) =>
          tx.question.update({
            where: { id: questionId },
            data: { order },
          })
        )
      );
    });
  }

  /**
   * 回答選択肢の並び順（order）の更新
   * @param optionOrderUpdates 呼び出し元で有効性を保証したデータ
   */
  @withErrorHandling()
  public async updateOptionOrder(
    optionOrderUpdates: {
      optionId: string;
      order: number;
    }[]
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        optionOrderUpdates.map(({ optionId, order }) =>
          tx.option.update({
            where: { id: optionId },
            data: { order },
          })
        )
      );
    });
  }

  /**
   * 設問の削除
   * @param questionId 呼び出し元で有効性を保証すべきセッションID
   */
  @withErrorHandling()
  public async delete(questionId: string): Promise<void> {
    await this.prisma.question.delete({ where: { id: questionId } });
  }

  // 設問の複製
  @withErrorHandling()
  public async duplicate(questionId: string): Promise<void> {
    // 1. コピー元の設問の取得 と デフォルト選択肢の取得
    const question = (await this.getById(
      questionId,
      forDuplicateQuestionSchema
    )) as PRS.QuestionGetPayload<typeof forDuplicateQuestionSchema>;

    // 1-1. コピー先に適用するデフォルト選択肢の取得
    const defaultOptionIndex = question.options.findIndex(
      (o) => o.id === question.defaultOptionId
    );
    if (defaultOptionIndex === -1) {
      throw new DomainRuleViolationError(
        "コピー元の設問に適切なデフォルト選択肢が設定されていません",
        question
      );
    }

    // 1-2. 設問の並び順の更新用のデータの準備
    const questionOrderUpdates = (
      await this.prisma.learningSession.findUnique({
        where: { id: question.sessionId },
        select: {
          questions: {
            select: { id: true, order: true },
            where: { order: { gt: question.order } },
          },
        },
      })
    )?.questions.map((q) => ({
      questionId: q.id,
      order: q.order + 1,
    }));

    let newQuestionId = "";
    let newDefaultOptionId = "";

    await this.prisma.$transaction(async (tx) => {
      //
      // 2. 設問の複製
      const newQuestion = await tx.question.create({
        data: {
          sessionId: question.sessionId,
          title: `Copy ${question.title}`.substring(0, 32),
          description: question.description,
          order: question.order + 1,
          defaultOptionId: null, // 仮値
        },
      });

      // 3. 選択肢の複製
      const optionSeeds = question.options.map((option) => ({
        questionId: newQuestion.id,
        order: option.order,
        title: option.title,
        description: option.description,
        rewardMessage: option.rewardMessage,
        rewardPoint: option.rewardPoint,
        effect: option.effect,
      }));
      await tx.option.createMany({
        data: optionSeeds,
      });

      // 4. defaultOptionIdの設定
      const options = await tx.option.findMany({
        where: { questionId: newQuestion.id },
        orderBy: { order: "asc" },
      });
      const newDefaultOption = options[defaultOptionIndex];
      await tx.question.update({
        where: { id: newQuestion.id },
        data: { defaultOptionId: newDefaultOption.id },
      });

      // 5. 並び順の更新  length > 0 の場合のみ実行
      if (questionOrderUpdates?.length) {
        await Promise.all(
          questionOrderUpdates.map(({ questionId, order }) =>
            tx.question.update({
              where: { id: questionId },
              data: { order },
            })
          )
        );
      }
      newQuestionId = newQuestion.id;
      newDefaultOptionId = newDefaultOption.id;
    });

    // 6. セッションに登録済みの学生がいれば、その学生のレスポンスにデフォルト選択肢を登録
    await this.registerDefaultResponsesForEnrolledStudents(
      question.sessionId,
      newQuestionId,
      newDefaultOptionId
    );
  }

  // 設問の新規作成・初期化
  @withErrorHandling()
  public async create(
    sessionId: string,
    order: number = 1,
    title: string = "設問01"
  ): Promise<Question> {
    // 1. 設問の作成
    const question = await this.prisma.question.create({
      data: {
        sessionId,
        order,
        title,
      },
    });

    // 2. 選択肢群の作成
    const initialOptionSet = Array.from({ length: optionSetSize }, (_, i) => ({
      questionId: question.id,
      order: i + 1,
      title: `選択肢${i + 1}`,
    }));

    await this.prisma.option.createMany({
      data: initialOptionSet,
    });

    // 3. 選択肢の取得 (createManyの戻値が使えないため)
    const options = await this.prisma.option.findMany({
      where: { questionId: question.id },
      orderBy: { order: "asc" },
    });

    // 4. 設問にデフォルト選択肢を設定
    const res = await this.prisma.question.update({
      where: { id: question.id },
      data: { defaultOptionId: options[0].id },
    });

    // 5. セッションに登録済みの学生がいれば、その学生のレスポンスにデフォルト選択肢を登録
    await this.registerDefaultResponsesForEnrolledStudents(
      sessionId,
      question.id,
      options[0].id
    );
    return res;
  }

  /**
   * 設問が新規作成・複製されたときに、その設問が所属するセッションに登録済みの学生が
   * いれば、その学生のレスポンスにデフォルト選択肢を登録する
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param questionId 呼び出し元で有効性を保証すべき設問ID
   * @param defaultOptionId 呼び出し元で有効性を保証すべきデフォルト選択肢ID
   */
  private async registerDefaultResponsesForEnrolledStudents(
    sessionId: string,
    questionId: string,
    defaultOptionId: string
  ): Promise<void> {
    // セッションに登録済みの学生を取得
    const studentIds = (
      await this.prisma.sessionEnrollment.findMany({
        where: {
          sessionId,
          deletedAt: null,
        },
      })
    ).map((e) => e.studentId);
    if (studentIds.length == 0) return;

    // デフォルト選択肢をレスポンスとして登録
    await Promise.all(
      studentIds.map((studentId) =>
        this.prisma.response.create({
          data: {
            sessionId,
            studentId,
            questionId,
            optionId: defaultOptionId, // デフォルト選択肢
          },
        })
      )
    );

    return;
  }

  /**
   * レスポンスの登録 (upsert)
   * @param userId 呼び出し元で有効性を保証すべきユーザID (studentId)
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param questionId 呼び出し元で有効性を保証すべき設問ID
   * @param optionId 呼び出し元で有効性を保証すべき設問ID
   */
  @withErrorHandling()
  public async upsertResponse(
    userId: string,
    sessionId: string,
    questionId: string,
    optionId: string
  ): Promise<void> {
    await this.prisma.response.upsert({
      where: {
        // 複合ユニークインデックスを指定
        unique_response_composite: {
          sessionId,
          studentId: userId,
          questionId,
        },
      },
      // レコードが存在しない場合の作成データ
      create: {
        sessionId,
        studentId: userId,
        questionId,
        optionId,
      },
      // レコードが存在する場合の更新データ（optionIdのみ）
      update: {
        optionId,
      },
    });
  }

  /**
   * 未回答の設問に対して、デフォルトの選択肢を回答として一括登録
   * @param studentId 呼び出し元で有効性を保証すべきユーザID
   * @param missingResponseQuestionIds 呼び出し元で有効性を保証すべき未回答設問IDのリスト
   * */
  @withErrorHandling()
  public async fillMissingDefaultResponses(
    studentId: string,
    missingResponseQuestionIds: string[]
  ): Promise<void> {
    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: missingResponseQuestionIds },
      },
      select: {
        id: true,
        sessionId: true,
        defaultOptionId: true,
      },
    });
    await Promise.all(
      questions.map((question) =>
        this.upsertResponse(
          studentId,
          question.sessionId,
          question.id,
          question.defaultOptionId!
        )
      )
    );
  }

  /**
   * 回答状況の取得
   * @param sessionId 呼び出し元で有効性を保証すべきセッションID
   * @param userId 呼び出し元で有効性を保証すべきユーザID
   */
  @withErrorHandling()
  public async getResponseStatus(
    sessionId: string,
    userId: string
  ): Promise<void> {}
}

export default QuestionService;
