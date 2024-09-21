// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  ApiError,
  NonTeacherOperationError,
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
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";
import {
  UpdateQuestionRequest,
  updateQuestionSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [PUT] /api/v1/teacher/questions/[id]/title
export const PUT = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const questionService = new QuestionService(prisma);
  const questionId = id;
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
      throw new DomainRuleViolationError(
        `${appUser.displayName} は、QuestionID: ${questionId} の編集権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, questionId }
      );
    }

    // リクエストボディの基本検証
    reqBody = await req.json();
    const updateQuestionTitleRequest = updateQuestionSchema.parse(reqBody);
    // title が存在することを確認
    if (!updateQuestionTitleRequest.title) {
      throw new DomainRuleViolationError("title は必須入力項目です。", {
        userId: appUser.id,
        userDisplayName: appUser.displayName,
        questionId,
      });
    }

    // 更新処理の実行
    await questionService.update(questionId, {
      id: questionId,
      title: updateQuestionTitleRequest.title.trim(),
    });

    return NextResponse.json(
      new SuccessResponseBuilder(null).setHttpStatus(StatusCodes.OK).build()
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
