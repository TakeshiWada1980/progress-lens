import prisma from "@/lib/prisma";

import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { NextResponse, NextRequest } from "next/server";
import UserService from "@/app/_services/userService";
import { getAuthUser, InvalidTokenError } from "@/app/api/_helpers/getAuthUser";
import { UserProfile, userProfileSchema } from "@/app/_types/UserTypes";
import { UserQueryOptions } from "@/app/_types/ServiceTypes";
import { getAvatarImgUrl } from "@/app/api/_helpers/getAvatarImgUrl";
import { ZodValidationError } from "@/app/api/_helpers/apiExceptions";
import { z } from "zod";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/user/profile
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.findUserById(authUser.id);

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

// [POST] /api/v1/user/profile
export const POST = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  let postBody: any;

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    postBody = await req.json();
    const userProfile = userProfileSchema.parse(postBody) as UserProfile;
    userProfile.displayName = userProfile.displayName.trim();

    // 更新（対象は displayName と avatarImgKey のみ）
    await userService.updateUser(authUser.id, userProfile);

    return NextResponse.json(
      new SuccessResponseBuilder(null).setHttpStatus(StatusCodes.OK).build()
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      error = new ZodValidationError(error.message, postBody);
    }
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
