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

type TransactionCapablePrisma = PrismaClient | PRS.TransactionClient;

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

    // await this.prisma.$transaction(
    //   questionOrderUpdates.map(({ questionId, order }) =>
    //     this.prisma.question.update({
    //       where: { id: questionId },
    //       data: { order },
    //     })
    //   )
    // );
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

    // await this.prisma.$transaction(
    //   optionOrderUpdates.map(({ optionId, order }) =>
    //     this.prisma.option.update({
    //       where: { id: optionId },
    //       data: { order },
    //     })
    //   )
    // );
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
    const defaultOptionTitle = question.options.find(
      (option) => option.id === question.defaultOptionId
    )?.title;
    if (!defaultOptionTitle) {
      throw new DomainRuleViolationError(
        "コピー元の設問にデフォルト選択肢が設定されていません",
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

    this.prisma.$transaction(async (tx) => {
      //
      // 2. 設問の複製
      const newQuestion = await tx.question.create({
        data: {
          sessionId: question.sessionId,
          title: `${question.title} (Copy)`,
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
      const newDefaultOptionId = options.find(
        (option) => option.title === defaultOptionTitle
      );
      if (!newDefaultOptionId) {
        throw new DomainRuleViolationError(
          "コピー先の回答選択肢にデフォルト選択肢の候補が見つかりません",
          options
        );
      }
      await tx.question.update({
        where: { id: newQuestion.id },
        data: { defaultOptionId: newDefaultOptionId.id },
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
    });
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
    return await this.prisma.question.update({
      where: { id: question.id },
      data: { defaultOptionId: options[0].id },
    });
  }
}

export default QuestionService;
