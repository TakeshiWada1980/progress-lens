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
import SessionService from "@/app/_services/sessionService";

// 型定義・データ検証関連
import { Role } from "@/app/_types/UserTypes";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";
import {
  UpdateSessionRequest,
  updateSessionRequestSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [PUT] /api/v1/teacher/sessions/[id] 指定IDのセッション情報を更新
export const PUT = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const sessionId = id;
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
        `${appUser.displayName} は、SessionID: ${sessionId} の削除権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, sessionId }
      );
    }

    // リクエストボディの検証
    reqBody = await req.json();
    const updateSessionRequest: UpdateSessionRequest =
      updateSessionRequestSchema.parse(reqBody);
    updateSessionRequest.title?.trim();

    // 更新処理の実行
    await sessionService.update(sessionId, updateSessionRequest);

    return NextResponse.json(
      new SuccessResponseBuilder(null).setHttpStatus(StatusCodes.OK).build()
    );
  } catch (error: any) {
    const payload = createErrorResponse(error);
    console.error(JSON.stringify(payload, null, 2));
    return NextResponse.json(payload, { status: payload.httpStatus });
  }
};

// [DELETE] /api/v1/teacher/sessions/[id] 指定IDのセッションを削除
export const DELETE = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const sessionId = id;

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
        `${appUser.displayName} は、SessionID: ${sessionId} の削除権限を持ちません。`,
        { userId: appUser.id, userDisplayName: appUser.displayName, sessionId }
      );
    }

    // 削除処理の実行
    await sessionService.delete(sessionId);

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
