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
} from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService, {
  forGetAllByTeacherIdSchema,
} from "@/app/_services/sessionService";

// 型定義・データ検証関連
import { UserProfile, Role } from "@/app/_types/UserTypes";
import { getAvatarImgUrl } from "@/app/api/_helpers/getAvatarImgUrl";
import { SessionSummary } from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/teacher/sessions/
// ユーザーが [教員] として作成したセッションの一覧を取得
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);
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

    // レスポンスデータの作成
    const sessions = await sessionService.getAllByTeacherId(
      appUser.id,
      forGetAllByTeacherIdSchema
    );
    const res: SessionSummary[] = sessions.map((s) => {
      return {
        id: s.id,
        title: s.title,
        teacherName: appUser.displayName,
        accessCode: s.accessCode,
        isActive: s.isActive,
        updatedAt: s.updatedAt,
        createdAt: s.createdAt,
        enrollmentCount: s.enrollments.length,
        questionsCount: s.questions.length,
      };
    });

    return NextResponse.json(
      new SuccessResponseBuilder<SessionSummary[]>(res)
        .setHttpStatus(StatusCodes.OK)
        .build()
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
