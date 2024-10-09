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
import QuestionService, {
  forUpdateQuestionSchema,
} from "@/app/_services/questionService";
import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { Role } from "@/app/_types/UserTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [DELETE] /api/v1/teacher/questions/[id]
export const DELETE = async (req: NextRequest, { params }: Params) => {
  const { id: questionId } = params;
  const userService = new UserService(prisma);
  const questionService = new QuestionService(prisma);
  let reqBody: any;

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // ユーザーが 教員 または 管理者 のロールを持たない場合は Error がスローされる
    if (appUser.role === Role.STUDENT) {
      throw new NonTeacherOperationError(appUser.id, appUser.displayName);
    }

    // 設問が存在しない場合は Error がスローされる
    const question = (await questionService.getById(
      questionId,
      forUpdateQuestionSchema
    )) as PRS.QuestionGetPayload<typeof forUpdateQuestionSchema>;

    // 設問が appUser の所有であるかを確認
    if (question.session.teacherId !== appUser.id) {
      throw new BadRequestError(
        `${appUser.displayName} は、QuestionID: ${questionId} の削除権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, questionId }
      );
    }

    // 削除処理の実行
    await questionService.delete(questionId);

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
