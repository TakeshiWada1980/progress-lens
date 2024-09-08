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

class QuestionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
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
    const question = (await this.prisma.question.findUniqueOrThrow({
      where: { id: sessionId },
      ...options,
    })) as PRS.QuestionGetPayload<{ include: T; select: U }>;
    return question;
  }

  // 設問の新規作成・初期化
  @withErrorHandling()
  public async createQuestion(
    sessionId: string,
    order: number = 1
  ): Promise<Question> {
    // 1. 設問の作成
    const question = await this.prisma.question.create({
      data: {
        sessionId,
        order,
        title: "設問X",
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
