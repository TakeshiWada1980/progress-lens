// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError, BadRequestError } from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";
import QuestionService, {
  forPostResponseSchema,
} from "@/app/_services/questionService";
import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { postResponseRequestSchema } from "@/app/_types/ResponseTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [POST] /api/v1/student/questions/[id]
export const POST = async (req: NextRequest, { params }: Params) => {
  const { id: questionId } = params;
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const questionService = new QuestionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // リクエストボディの基本検証 (問題があれば ZodValidationError がスローされる)
    const reqBody = await req.json();
    const postResponseRequest = postResponseRequestSchema.parse(reqBody);

    // (1) URLとBodyのIDが一致することを確認
    if (questionId !== postResponseRequest.questionId) {
      throw new BadRequestError(
        `リクエストボディの設問IDとURLの設問IDが一致しません。`,
        {
          urlId: questionId,
          body: postResponseRequest,
        }
      );
    }

    // (2) 設問をDBから取得 (存在しない場合は Error がスローされる)
    const question = (await questionService.getById(
      questionId,
      forPostResponseSchema
    )) as PRS.QuestionGetPayload<typeof forPostResponseSchema>;

    // (3) リクエストボディのオプションIDが設問に存在することを確認
    const option = question.options.find(
      (option) => option.id === postResponseRequest.optionId
    );
    // prettier-ignore
    if (!option) throw new BadRequestError(`リクエストボディの「オプションID」が不正です。`,null);

    // (4) セッションがアクティブであることを確認
    if (!question.session.isActive) {
      throw new BadRequestError(`セッションがアクティブではありません。`, {
        session: question.session,
      });
    }

    // (5) ユーザがセッションに参加していることを確認
    const isEnrolled = await sessionService.isStudentEnrolled(
      question.sessionId,
      appUser.id
    );
    if (!isEnrolled) {
      throw new BadRequestError(`ユーザがセッションに参加していません。`, null);
    }

    // ユーザの回答を登録
    await questionService.upsertResponse(
      appUser.id,
      question.sessionId,
      postResponseRequest.questionId,
      postResponseRequest.optionId
    );

    return NextResponse.json(
      new SuccessResponseBuilder(null).setHttpStatus(StatusCodes.OK).build()
    );
  } catch (error: any) {
    const payload = createErrorResponse(error);
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
