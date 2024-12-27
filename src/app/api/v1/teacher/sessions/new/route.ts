// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  ApiError,
  ZodValidationError,
  NonTeacherOperationError,
  GuestNotAllowedError,
} from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";

// 型定義・データ検証関連
import { z } from "zod";
import { Role } from "@/app/_types/UserTypes";
import {
  CreateSessionRequest,
  createSessionRequestSchema,
  SessionSummary,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

// [POST] /api/v1/teacher/sessions/new セッションの新規作成
export const POST = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
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

    // ゲストユーザからの要求を拒否
    if (appUser.isGuest) {
      throw new GuestNotAllowedError(appUser.id, appUser.displayName);
    }

    // リクエストボディの検証
    reqBody = await req.json();
    const createSessionRequest: CreateSessionRequest =
      createSessionRequestSchema.parse(reqBody);
    createSessionRequest.title = createSessionRequest.title.trim();

    // ラーニングセッションの新規作成処理
    const session = await sessionService.create(
      appUser.id,
      createSessionRequest.title
    );

    const res: SessionSummary = {
      id: session.id,
      title: session.title,
      teacherName: appUser.displayName,
      accessCode: session.accessCode,
      isActive: session.isActive,
      allowGuestEnrollment: session.allowGuestEnrollment,
      enrollmentCount: 0,
      questionsCount: 1,
      updatedAt: session.updatedAt,
      createdAt: session.createdAt,
    };

    // レスポンス
    return NextResponse.json(
      new SuccessResponseBuilder(res).setHttpStatus(StatusCodes.CREATED).build()
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      error = new ZodValidationError(error.message, reqBody);
    }
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
