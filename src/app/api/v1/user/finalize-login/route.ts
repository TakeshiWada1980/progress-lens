import prisma from "@/lib/prisma";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { NextResponse, NextRequest } from "next/server";
import UserService from "@/app/_services/userService";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import { RedirectTo } from "@/app/_types/RedirectTo";
import { ApiError } from "@/app/api/_helpers/apiExceptions";
import { Role } from "@prisma/client";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/user/finalize-login
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);
    const appUser = await userService.tryFindUserById(authUser.id);

    //TODO: appUser?.isGuest の場合は displayName と avatarImgKey を初期化

    // appUser が存在するなら早期リターン
    if (appUser) {
      let redirectTo = "/"; // 学生用ページができたら変更
      switch (appUser.role) {
        case Role.TEACHER:
          redirectTo = "/"; // 教員用ページができたら変更
          break;
        case Role.ADMIN:
          redirectTo = "/"; // 管理者用ページができたら変更
          break;
        default:
          break;
      }
      const res = {
        redirectTo,
      } as RedirectTo;
      return NextResponse.json(
        new SuccessResponseBuilder(res).setHttpStatus(StatusCodes.OK).build()
      );
    }

    // appUser が存在しないなら appUser にレコードを挿入（新規作成）
    const name = (authUser.email ?? "").split("@")[0]; // 仮の表示名
    await userService.createUserAsStudent(authUser.id, name);

    // プロフィール設定画面にリダイレクト
    const res = {
      redirectTo: "/user/profile",
    } as RedirectTo;

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
