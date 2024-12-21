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
import SessionService, {
  forEditSessionSchema,
} from "@/app/_services/sessionService";

import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { Role } from "@/app/_types/UserTypes";
import {
  SessionEditableFields,
  QuestionEditableFields,
  OptionEditableFields,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [POST] /api/v1/teacher/questions/[id]/duplicate
export const POST = async (req: NextRequest, { params: { id } }: Params) => {
  const questionId = id;
  const userService = new UserService(prisma);
  const questionService = new QuestionService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // ユーザーが 教員 または 管理者 のロールを持たない場合は Error がスローされる
    if (appUser.role === Role.STUDENT) {
      throw new NonTeacherOperationError(appUser.id, appUser.displayName);
    }

    // セッションが存在しない場合は Error がスローされる
    const question = (await questionService.getById(
      questionId,
      forUpdateQuestionSchema
    )) as PRS.QuestionGetPayload<typeof forUpdateQuestionSchema>;

    // セッションが appUser の所有であるかを確認
    if (question.session.teacherId !== appUser.id) {
      throw new DomainRuleViolationError(
        `${appUser.displayName} は、QuestionID: ${questionId} の編集権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, questionId }
      );
    }

    // 設問を複製する
    await questionService.duplicate(questionId);

    // NOTE: もし、ネットワークオーバーヘッドが問題になるときは、
    // ここで [GET] /api/v1/teacher/sessions/[id] と同じものを返すことも再検討
    // 現状では、RESTful原則・責務分離のため、このEPは成功レスポンスのみを返す

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
