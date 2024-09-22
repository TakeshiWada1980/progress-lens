// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  ApiError,
  NonTeacherOperationError,
  BadRequestError,
} from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";
import QuestionService, {
  forEditQuestionSchema,
} from "@/app/_services/questionService";
import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { v4 as uuid } from "uuid";
import { Role } from "@/app/_types/UserTypes";
import {
  addQuestionRequestSchema,
  AddQuestionResponse,
  OptionEditFields,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

// [POST] /api/v1/teacher/questions/new　セッションに設問を追加
export const POST = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const questionService = new QuestionService(prisma);

  let reqBody: any;

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // ユーザーが 教員 または 管理者 のロールを持たない場合は Error がスローする
    if (appUser.role === Role.STUDENT) {
      throw new NonTeacherOperationError(appUser.id, appUser.displayName);
    }

    // リクエストボディの検証
    reqBody = await req.json();
    const addQuestionRequest = addQuestionRequestSchema.parse(reqBody);
    const sessionId = addQuestionRequest.sessionId;

    // セッションが存在しない場合は Error がスローされる
    const session = await sessionService.getById(sessionId);

    // セッションが appUser の所有であるかを確認
    if (session.teacherId !== appUser.id) {
      throw new BadRequestError(
        `${appUser.displayName} は、SessionID: ${sessionId} の設問追加権限を持ちません。`,
        {
          userId: appUser.id,
          userDisplayName: appUser.displayName,
          sessionId,
          sessionTitle: session.title,
        }
      );
    }

    // 設問の追加
    const { id: questionId } = await questionService.createQuestion(
      sessionId,
      addQuestionRequest.order,
      addQuestionRequest.title
    );

    // レスポンス生成
    const question = (await questionService.getById(
      questionId,
      forEditQuestionSchema
    )) as PRS.QuestionGetPayload<typeof forEditQuestionSchema>;

    const res: AddQuestionResponse = {
      id: questionId,
      order: question.order,
      title: question.title,
      description: question.description,
      defaultOptionId: question.defaultOptionId,
      compareKey: uuid(),
      options: question.options.map((o): OptionEditFields => {
        return {
          id: o.id,
          order: o.order,
          title: o.title,
          questionId: o.questionId,
          description: o.description,
          rewardMessage: o.rewardMessage ?? "",
          rewardPoint: o.rewardPoint,
          effect: o.effect,
          compareKey: uuid(),
        };
      }),
    } as AddQuestionResponse;

    return NextResponse.json(
      new SuccessResponseBuilder(res).setHttpStatus(StatusCodes.OK).build()
    );
  } catch (error: any) {
    const payload = createErrorResponse(error);
    console.error(JSON.stringify(payload, null, 2));
    return NextResponse.json(payload, { status: payload.httpStatus });
  }
};

// 失敗時のレスポンスを生成
const createErrorResponse = (error: unknown): ApiErrorResponse => {
  if (error instanceof ApiError) {
    return new ErrorResponseBuilder(error).build();
  }
  return new ErrorResponseBuilder().setUnknownError(error).build();
};
