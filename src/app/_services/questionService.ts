import { PrismaClient } from "@prisma/client";
import { optionSetSize } from "@/config/app-config";
import type { Question } from "@prisma/client";
import { withErrorHandling } from "@/app/_services/servicesExceptions";
import { Prisma as PRS } from "@prisma/client";
import {
  type UpdateQuestionRequest,
  type UpdateOptionRequest,
} from "@/app/_types/SessionTypes";

///////////////////////////////////////////////////////////////

export type QuestionReturnType<
  T extends PRS.QuestionInclude,
  U extends PRS.QuestionSelect
> = {
  include?: T;
  select?: U;
  // orderBy?:
  //   | PRS.QuestionOrderByWithRelationInput
  //   | PRS.QuestionOrderByWithRelationInput[];
};

export type OptionReturnType<
  T extends PRS.OptionInclude,
  U extends PRS.OptionSelect
> = {
  include?: T;
  select?: U;
  // orderBy?:
  //   | PRS.OptionOrderByWithRelationInput
  //   | PRS.OptionOrderByWithRelationInput[];
};

///////////////////////////////////////////////////////////////

export const forEditQuestionSchema = {
  select: {
    id: true,
    order: true,
    title: true,
    description: true,
    defaultOptionId: true,
    options: {
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
    },
  },
};

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
  private prisma: TransactionCapablePrisma;

  constructor(prisma: TransactionCapablePrisma) {
    this.prisma = prisma;
  }

  private isPrismaClient(
    client: TransactionCapablePrisma
  ): client is PrismaClient {
    return (
      "$transaction" in client &&
      typeof (client as any).$transaction === "function"
    );
  }

  // DIされたものが PrismaClient か TransactionClient かで処理を分岐
  private async withTransaction<T>(
    operation: (client: TransactionCapablePrisma) => Promise<T>
  ): Promise<T> {
    if (this.isPrismaClient(this.prisma)) {
      return await this.prisma.$transaction(operation);
    } else {
      return await operation(this.prisma);
    }
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
    return await this.withTransaction(async (client) => {
      const question = (await client.question.findUniqueOrThrow({
        where: { id: id },
        ...options,
      })) as PRS.QuestionGetPayload<{ include: T; select: U }>;
      return question;
    });
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
    return await this.withTransaction(async (client) => {
      const question = (await client.option.findUniqueOrThrow({
        where: { id: id },
        ...options,
      })) as PRS.OptionGetPayload<{ include: T; select: U }>;
      return question;
    });
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
    await this.withTransaction(async (client) => {
      const { id, ...updateData } = data; // id を除外する
      await client.question.update({
        where: { id: questionId },
        data: { ...updateData },
      });
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
    await this.withTransaction(async (client) => {
      const { id, ...updateData } = data; // id を除外する
      await client.option.update({
        where: { id: optionId },
        data: { ...updateData },
      });
    });
  }

  /**
   * 設問の削除
   * @param questionId 呼び出し元で有効性を保証すべきセッションID
   */
  @withErrorHandling()
  public async delete(questionId: string): Promise<void> {
    await this.withTransaction(async (client) => {
      await client.question.delete({ where: { id: questionId } });
    });
  }

  // 設問の新規作成・初期化
  @withErrorHandling()
  public async create(
    sessionId: string,
    order: number = 1,
    title: string = "設問01"
  ): Promise<Question> {
    return await this.withTransaction(async (client) => {
      // 1. 設問の作成
      const question = await client.question.create({
        data: {
          sessionId,
          order,
          title,
        },
      });

      // 2. 選択肢群の作成
      const initialOptionSet = Array.from(
        { length: optionSetSize },
        (_, i) => ({
          questionId: question.id,
          order: i + 1,
          title: `選択肢${i + 1}`,
        })
      );

      await client.option.createMany({
        data: initialOptionSet,
      });

      // 3. 選択肢の取得 (createManyの戻値が使えないため)
      const options = await client.option.findMany({
        where: { questionId: question.id },
        orderBy: { order: "asc" },
      });

      // 4. 設問にデフォルト選択肢を設定
      return await client.question.update({
        where: { id: question.id },
        data: { defaultOptionId: options[0].id },
      });
    });
  }
}

export default QuestionService;
