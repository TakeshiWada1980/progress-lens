// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  ApiError,
  GuestNotAllowedError,
} from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import UserService from "@/app/_services/userService";
import SessionService, {
  forEditSessionSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";
import { verifySessionOwnershipAndPermissions } from "./_helpers/verifySessionAuth";

// 型定義・データ検証関連
import {
  SessionEditableFields,
  QuestionEditableFields,
  OptionEditableFields,
  UpdateSessionRequest,
  updateSessionRequestSchema,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [GET] /api/v1/teacher/sessions/[id] 編集のためのセッション情報を取得
export const GET = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const sessionId = id;

  try {
    // prettier-ignore
    // セッションの所有権と操作権限を確認
    await verifySessionOwnershipAndPermissions(req, sessionId, userService, sessionService);

    const session = (await sessionService.getById(
      sessionId,
      forEditSessionSchema
    )) as PRS.LearningSessionGetPayload<typeof forEditSessionSchema>;

    const res: SessionEditableFields = {
      id: session.id,
      title: session.title,
      accessCode: session.accessCode,
      isActive: session.isActive,
      allowGuestEnrollment: session.allowGuestEnrollment,
      teacherId: session.teacherId,
      questions: session.questions.map((q): QuestionEditableFields => {
        return {
          id: q.id,
          order: q.order,
          title: q.title,
          description: q.description,
          defaultOptionId: q.defaultOptionId!,
          options: q.options.map((option): OptionEditableFields => {
            return {
              ...option,
            };
          }),
        };
      }),
    };

    return NextResponse.json(
      new SuccessResponseBuilder<SessionEditableFields>(res)
        .setHttpStatus(StatusCodes.OK)
        .build()
    );
  } catch (error: any) {
    const payload = createErrorResponse(error);
    console.error(JSON.stringify(payload, null, 2));
    return NextResponse.json(payload, { status: payload.httpStatus });
  }
};

// [PUT] /api/v1/teacher/sessions/[id] 指定IDのセッション情報を更新
export const PUT = async (req: NextRequest, { params: { id } }: Params) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);
  const sessionId = id;
  let reqBody: any;

  try {
    // prettier-ignore
    // セッションの所有権と操作権限を確認
    await verifySessionOwnershipAndPermissions(req, sessionId, userService, sessionService);

    // リクエストボディの検証
    reqBody = await req.json();
    const updateSessionRequest: UpdateSessionRequest =
      updateSessionRequestSchema.parse(reqBody);

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
    // セッションの所有権と操作権限を確認
    const { appUser } = await verifySessionOwnershipAndPermissions(
      req,
      sessionId,
      userService,
      sessionService
    );

    // ゲストユーザからの要求を拒否
    if (appUser.isGuest) {
      throw new GuestNotAllowedError(appUser.id, appUser.displayName);
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
