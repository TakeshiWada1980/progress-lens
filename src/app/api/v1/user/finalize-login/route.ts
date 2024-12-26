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

// 型定義・データ検証関連
import { RedirectTo } from "@/app/_types/RedirectTo";
import { resolveDashboardPage } from "@/app/_utils/resolveDashboardPage";

export const revalidate = 0; // キャッシュを無効化

// [GET] /api/v1/user/finalize-login
export const GET = async (req: NextRequest) => {
  const userService = new UserService(prisma);

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);
    const appUser = await userService.tryGetById(authUser.id);

    // appUser が存在するなら早期リターン
    if (appUser) {
      const res = {
        redirectTo: resolveDashboardPage(appUser.role),
      } as RedirectTo;
      return NextResponse.json(
        new SuccessResponseBuilder(res).setHttpStatus(StatusCodes.OK).build()
      );
    }

    // appUser が存在しないなら appUser にレコードを挿入（新規作成）
    const name = (authUser.email ?? "").split("@")[0]; // 仮の表示名
    await userService.createAsStudent(authUser.id, name);

    // 名前などを設定して欲しいのでプロフィール設定画面にリダイレクト
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
