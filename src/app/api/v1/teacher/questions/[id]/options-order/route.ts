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
  UpdateOptionsOrderRequest,
  updateOptionsOrderSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [PUT] /api/v1/teacher/questions/[id]/options-order
export const PUT = async (req: NextRequest, { params: { id } }: Params) => {
  const questionId = id;
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

    // リクエストボディの検証
    reqBody = await req.json();
    const optionsOrderRequest: UpdateOptionsOrderRequest =
      updateOptionsOrderSchema.parse(reqBody);

    // question に含まれる全ての optionId と
    // optionsOrderRequest に含まれている全ての optionId が一致するかを確認
    const questionOptionsIds = question.options.map((o) => o.id);
    const requestOptionIds = optionsOrderRequest.data.map((q) => q.optionId);
    if (
      questionOptionsIds.length !== requestOptionIds.length ||
      !questionOptionsIds.every((id) => requestOptionIds.includes(id))
    ) {
      throw new BadRequestError(
        "リクエストボディに含まれる questionId が不正です。"
      );
    }

    console.log(JSON.stringify(optionsOrderRequest, null, 2));

    // セッションの設問の順番を更新
    await questionService.updateOptionOrder(optionsOrderRequest.data);

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
