// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError, BadRequestError } from "@/app/api/_helpers/apiExceptions";
import AppErrorCode from "@/app/_types/AppErrorCode";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService, {
  forGetResponsesSchema,
} from "@/app/_services/userService";
import SessionService, {
  forSnapshotSessionSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";
import { isAccessCode } from "@/app/_types/SessionTypes";
import {
  SessionSnapshot,
  QuestionSnapshot,
  OptionSnapshot,
} from "@/app/_types/SessionTypes";

export const revalidate = 0; // キャッシュを無効化

type Params = { params: { id: string } };

// [GET] /api/v1/student/sessions/[code]
// accessCode に読み替えて処理することに注意
export const GET = async (req: NextRequest, { params: { id } }: Params) => {
  const accessCode = id; // 読み替え注意
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // パスパラメータ [code] の検証
    if (!isAccessCode(accessCode)) {
      throw new BadRequestError("Invalid access code.", {
        accessCode: accessCode,
      });
    }

    // アクセスコードからセッションを取得。存在しない場合は Error がスローされる
    const session = (await sessionService.getByAccessCode(
      accessCode,
      forSnapshotSessionSchema
    )) as PRS.LearningSessionGetPayload<typeof forSnapshotSessionSchema>;

    // ユーザがセッションに参加しているかを確認
    const isEnrolled = await sessionService.isStudentEnrolled(
      session.id,
      appUser.id
    );
    if (!isEnrolled && session.teacherId !== appUser.id) {
      throw new BadRequestError("Not enrolled in the session.", {
        sessionId: session.id,
        userId: appUser.id,
        accessCode: accessCode,
        title: session.title,
      });
    }

    // 当該ユーザの回答状況を取得
    // prettier-ignore
    let userSelected: PRS.ResponseGetPayload<typeof forGetResponsesSchema>[] = [];
    if (isEnrolled) {
      userSelected = (await userService.getResponses(
        appUser.id,
        session.id,
        forGetResponsesSchema
      )) as PRS.ResponseGetPayload<typeof forGetResponsesSchema>[];
    }
    const userSelectedOptionIds = new Set(userSelected.map((s) => s.optionId));

    // 全体の回答状況を取得
    const res: SessionSnapshot = {
      id: session.id,
      title: session.title,
      accessCode: session.accessCode,
      isActive: session.isActive,
      teacherId: session.teacherId,
      teacherName: session.teacher.user.displayName,
      questions: session.questions.map((q): QuestionSnapshot => {
        return {
          id: q.id,
          order: q.order,
          title: q.title,
          description: q.description,
          defaultOptionId: q.defaultOptionId!,
          options: q.options.map((option): OptionSnapshot => {
            return {
              id: option.id,
              questionId: option.questionId,
              order: option.order,
              title: option.title,
              description: option.description,
              rewardMessage: option.rewardMessage,
              rewardPoint: option.rewardPoint,
              effect: option.effect,
              responseCount: option._count.responses,
              isUserResponse: userSelectedOptionIds.has(option.id),
            };
          }),
        };
      }),
      previewMode: !isEnrolled,
    };

    return NextResponse.json(
      new SuccessResponseBuilder<SessionSnapshot>(res)
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
