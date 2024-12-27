// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  ApiError,
  BadRequestError,
  GuestNotAllowedError,
} from "@/app/api/_helpers/apiExceptions";
import AppErrorCode from "@/app/_types/AppErrorCode";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";

// 型定義・データ検証関連
import { SessionEnrollmentResponse } from "@/app/_types/SessionTypes";
import { isAccessCode } from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [GET] /api/v1/student/sessions/[code]/enroll
// 学生としてセッションに参加 ※ id を accessCode に読み替えて処理することに注意
export const GET = async (req: NextRequest, { params: { id } }: Params) => {
  const code = id; // 読み替え注意
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // パスパラメータ [code] の検証
    if (!isAccessCode(code)) {
      throw new BadRequestError("Invalid access code.", { accessCode: code });
    }

    // アクセスコードからセッションを取得。存在しない場合は Error がスローされる
    const session = await sessionService.getByAccessCode(code);
    if (!session.isActive) {
      const err = new BadRequestError(`Session (${code}) is not active.`, {
        accessCode: code,
      });
      err.appErrorCode = AppErrorCode.SESSION_NOT_ACTIVE;
      throw err;
    }

    // ゲストユーザの参加許可を確認
    if (!session.allowGuestEnrollment && appUser.isGuest) {
      throw new GuestNotAllowedError(appUser.id, appUser.displayName);
    }

    // セッションに参加
    await sessionService.enrollStudent(session.id, appUser.id);

    // レスポンスデータの作成
    const res: SessionEnrollmentResponse = {
      id: session.id,
      title: session.title,
      accessCode: session.accessCode,
    };

    return NextResponse.json(
      new SuccessResponseBuilder<SessionEnrollmentResponse>(res)
        .setHttpStatus(StatusCodes.OK)
        .build()
    );
  } catch (error: any) {
    const payload = createErrorResponse(error);
    return NextResponse.json(payload, { status: payload.httpStatus });
  }
};

// [DELETE] /api/v1/student/sessions/[id]/enroll 指定IDのセッションから登録解除
// ここは パスパラメータ id を sessionId として処理することに注意
export const DELETE = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const sessionId = id;

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // ゲストユーザからの要求を拒否
    if (appUser.isGuest) {
      throw new GuestNotAllowedError(appUser.id, appUser.displayName);
    }

    // 登録済みかを確認。未登録の場合は BadRequestError がスローされる
    const isEnrolled = await sessionService.isStudentEnrolled(
      sessionId,
      appUser.id
    );
    if (!isEnrolled) {
      throw new BadRequestError("Not enrolled in the session.", {
        sessionId,
        userId: appUser.id,
      });
    }

    // 退出処理の実行
    await sessionService.unenrollStudent(sessionId, appUser.id);

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
