// APIリクエスト・レスポンス関係
import { NextResponse, NextRequest } from "next/server";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";

// 型定義・データ検証関連
import { UserProfile } from "@/app/_types/UserTypes";
import { getAvatarImgUrl } from "@/app/api/_helpers/getAvatarImgUrl";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/session/
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  const sessionService = new SessionService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.getById(authUser.id);

    // レスポンスデータの作成
    const avatarImgUrl = await getAvatarImgUrl(appUser.avatarImgKey);
    const res: UserProfile = {
      id: appUser.id,
      displayName: appUser.displayName,
      role: appUser.role,
      avatarImgKey: appUser.avatarImgKey ?? undefined,
      avatarImgUrl: avatarImgUrl,
    };

    return NextResponse.json(
      new SuccessResponseBuilder(res).setHttpStatus(StatusCodes.OK).build()
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
