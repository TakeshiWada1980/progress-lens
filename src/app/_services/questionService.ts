import { PrismaClient } from "@prisma/client";
import { optionSetSize } from "@/config/app-config";
import type { Question } from "@prisma/client";
import { withErrorHandling } from "@/app/_services/servicesExceptions";
import { Prisma as PRS } from "@prisma/client";
import { type UpdateQuestionRequest } from "@/app/_types/SessionTypes";

///////////////////////////////////////////////////////////////

export type QuestionReturnType<
  T extends PRS.QuestionInclude,
  U extends PRS.QuestionSelect
> = {
  include?: T;
  select?: U;
};

///////////////////////////////////////////////////////////////

export const forUpdateQuestionSchema = {
  include: {
    session: {
      select: {
        teacherId: true,
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
   * @param id 呼び出し元で有効性を【保証不要】のセッションID
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
   * 設問の基本情報の更新
   * @param questionId 呼び出し元で有効性を保証すべきセッションID
   * @param data バリデーション済みの更新データ
   * @note dataに id が含まれていても内部処理で無視するので問題ない
   */
  @withErrorHandling()
  public async update(
    questionId: string,
    data: UpdateQuestionRequest
  ): Promise<void> {
    const { id, ...updateData } = data; // id は更新させない
    await this.prisma.question.update({
      where: { id: questionId },
      data: { ...data },
    });
  }

  // 設問の新規作成・初期化
  @withErrorHandling()
  public async createQuestion(
    sessionId: string,
    order: number = 1
  ): Promise<Question> {
    return await this.withTransaction(async (client) => {
      // 1. 設問の作成
      const question = await client.question.create({
        data: {
          sessionId,
          order,
          title: "設問X",
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
