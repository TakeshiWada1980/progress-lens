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
  forGetAllByStudentIdSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { UserProfile, Role } from "@/app/_types/UserTypes";
import { getAvatarImgUrl } from "@/app/api/_helpers/getAvatarImgUrl";
import { SessionSummary } from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/student/sessions/
// ユーザーが [学生] として作成したセッションの一覧を取得
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // レスポンスデータの作成
    const sessions = (await sessionService.getAllByStudentId(
      appUser.id,
      forGetAllByStudentIdSchema
    )) as PRS.LearningSessionGetPayload<typeof forGetAllByStudentIdSchema>[];

    const res: SessionSummary[] = sessions.map((s) => {
      return {
        id: s.id,
        title: s.title,
        teacherName: s.teacher.user.displayName,
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
