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
import SessionService, {
  forEditSessionSchema,
} from "@/app/_services/sessionService";
import QuestionService, {
  forUpdateQuestionSchema,
} from "@/app/_services/questionService";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { Role } from "@/app/_types/UserTypes";
import {
  UpdateQuestionsOrderRequest,
  updateQuestionsOrderSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [PUT] /api/v1/teacher/sessions/[id]/questions-order
export const PUT = async (req: NextRequest, { params: { id } }: Params) => {
  const sessionId = id;
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
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

    // セッションが存在しない場合は Error がスローされる
    const session = await sessionService.getById(sessionId);

    // セッションが appUser の所有であるかを確認
    if (session.teacherId !== appUser.id) {
      throw new DomainRuleViolationError(
        `${appUser.displayName} は、SessionID: ${sessionId} の編集権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, sessionId }
      );
    }

    // リクエストボディの検証
    reqBody = await req.json();
    const questionsOrderRequest: UpdateQuestionsOrderRequest =
      updateQuestionsOrderSchema.parse(reqBody);

    // session に含まれる全ての questionId と
    // questionsOrderRequest に含まれている全ての questionId が一致するかを確認
    const sessionQuestionIds = session.questions.map((q) => q.id);
    const requestQuestionIds = questionsOrderRequest.data.map(
      (q) => q.questionId
    );
    if (
      sessionQuestionIds.length !== requestQuestionIds.length ||
      !sessionQuestionIds.every((id) => requestQuestionIds.includes(id))
    ) {
      throw new BadRequestError(
        "リクエストボディに含まれる questionId が不正です。"
      );
    }

    // セッションの設問の順番を更新
    await questionService.updateOrder(questionsOrderRequest.data);

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
