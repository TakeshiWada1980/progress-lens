import { PrismaClient } from "@prisma/client";
import { optionSetSize } from "@/config/app-config";
import type { Question } from "@prisma/client";
import { withErrorHandling } from "@/app/_services/servicesExceptions";
import { Prisma as PRS } from "@prisma/client";

export type QuestionReturnType<
  T extends PRS.QuestionInclude,
  U extends PRS.QuestionSelect
> = {
  include?: T;
  select?: U;
};

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

  // 設問の取得
  @withErrorHandling()
  public async findSession<
    T extends PRS.QuestionInclude,
    U extends PRS.QuestionSelect
  >(
    sessionId: string,
    options?: QuestionReturnType<T, U>
  ): Promise<PRS.QuestionGetPayload<{ include: T; select: U }>> {
    return await this.withTransaction(async (client) => {
      const question = (await client.question.findUniqueOrThrow({
        where: { id: sessionId },
        ...options,
      })) as PRS.QuestionGetPayload<{ include: T; select: U }>;
      return question;
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
