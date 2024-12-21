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
import {
  UpdateQuestionRequest,
  updateQuestionSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

const Attr = {
  title: "title",
  defaultOptionId: "default-option-id",
} as const;
type Attr = (typeof Attr)[keyof typeof Attr];

const requiredFields: Record<Attr, keyof UpdateQuestionRequest> = {
  [Attr.title]: Attr.title,
  [Attr.defaultOptionId]: "defaultOptionId",
};

type Params = { params: { id: string; attr: Attr } };

// [PUT] /api/v1/teacher/questions/[id]/[attr]
export const PUT = async (req: NextRequest, { params }: Params) => {
  const { id: questionId, attr } = params;
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
        `${appUser.displayName} は、QuestionID: ${questionId} の編集権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, questionId }
      );
    }

    // リクエストボディの基本検証 問題があれば ZodValidationError がスローされる
    reqBody = await req.json();
    const updateQuestionRequest = updateQuestionSchema.parse(reqBody);

    // URLとBodyのIDが一致することを確認
    if (questionId !== updateQuestionRequest.id) {
      throw new BadRequestError(`URLとリクエストボディの ID が一致しません。`, {
        urlId: questionId,
        bodyId: updateQuestionRequest.id,
      });
    }

    // defaultOptionId に関するチェック
    if (attr === Attr.defaultOptionId) {
      // prettier-ignore
      if (!question.options.map((o) => o.id).includes(updateQuestionRequest.defaultOptionId!)) {
        throw new BadRequestError(`指定の defaultOptionId は、当該設問の選択肢に存在しません`, reqBody);
      }
    }

    // パスに応じた必須属性の検証
    // 例えば /teacher/questions/[id]/title なら title 属性が必須
    if (!updateQuestionRequest[requiredFields[attr]]) {
      throw new BadRequestError(
        `エンドポイント ${req.nextUrl.pathname} に対するリクエストボディに ${attr} は必須です。`,
        reqBody
      );
    }

    // 更新処理の実行
    switch (attr) {
      case Attr.title:
        await questionService.update(questionId, {
          id: questionId,
          title: updateQuestionRequest.title,
        });
        break;
      case Attr.defaultOptionId:
        await questionService.update(questionId, {
          id: questionId,
          defaultOptionId: updateQuestionRequest.defaultOptionId,
        });
        break;
    }

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
