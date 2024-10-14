// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import UserService from "@/app/_services/userService";
import QuestionService from "@/app/_services/questionService";
import SessionService, {
  forGetAllByTeacherIdSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";
import { verifySessionOwnershipAndPermissions } from "../_helpers/verifySessionAuth";

// 型定義・データ検証関連
import { SessionSummary } from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [POST] /api/v1/teacher/session/[id]/duplicate
export const POST = async (req: NextRequest, { params: { id } }: Params) => {
  const sessionId = id;
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const questionService = new QuestionService(prisma);

  try {
    // セッションの所有権と操作権限を確認
    const { appUser } = await verifySessionOwnershipAndPermissions(
      req,
      sessionId,
      userService,
      sessionService
    );

    // 設問を複製する
    await sessionService.duplicate(sessionId);

    // NOTE: もし、ネットワークオーバーヘッドが問題になるときは、
    // ここで [GET] /api/v1/teacher/sessions/ と同じものを返すことも再検討
    // 現状では、RESTful原則・責務分離のため、このEPは成功レスポンスのみを返す

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
