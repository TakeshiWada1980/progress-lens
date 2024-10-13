// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError, BadRequestError } from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService, {
  forAnswerSessionSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [GET] /api/v1/student/sessions/[id]
export const GET = async (req: NextRequest, { params: { id } }: Params) => {
  const sessionId = id; // 読み替え注意
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // セッションが存在しない場合は Error がスローされる
    const session = await sessionService.getById(sessionId);

    // ユーザがセッションに参加しているかを確認
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

    // DBからレスポンスデータの取得
    const res = (await sessionService.getById(
      sessionId,
      forAnswerSessionSchema
    )) as PRS.LearningSessionGetPayload<typeof forAnswerSessionSchema>;

    return NextResponse.json(
      new SuccessResponseBuilder<null>(null)
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
