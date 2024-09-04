import prisma from "@/lib/prisma";

import { ApiErrorResponse } from "@/app/_types/ApiResponse";
import SuccessResponseBuilder from "@/app/api/_helpers/successResponseBuilder";
import ErrorResponseBuilder from "@/app/api/_helpers/errorResponseBuilder";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { NextResponse, NextRequest } from "next/server";
import UserService from "@/app/_services/userService";
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import { UserNewRole, userNewRoleSchema } from "@/app/_types/UserTypes";
import {
  ZodValidationError,
  NonAdminOperationError,
} from "@/app/api/_helpers/apiExceptions";
import { z } from "zod";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

export const revalidate = 0; // キャッシュを無効化

// [POST] /api/v1/user/assign-role
export const POST = async (req: NextRequest) => {
  const userService = new UserService(prisma);
  let postBody: any;

  try {
    // トークンが不正なときは InvalidTokenError がスローされる
    const authUser = await getAuthUser(req);

    // ユーザが存在しない場合は UserService.NotFoundError がスローされる
    const appUser = await userService.findUserById(authUser.id);

    // ユーザーが管理者でない場合は NonAdminOperationError がスローされる
    if (appUser.role !== "ADMIN") {
      throw new NonAdminOperationError(appUser.id, appUser.displayName);
    }

    postBody = await req.json();
    const userNewRole = userNewRoleSchema.parse(postBody) as UserNewRole;

    // ロールの更新
    // 変更対象のユーザ (userNewRole.id) の存在確認と、
    // 許可されたロール変更操作 (STUDENT -> TEACHER, TEACHER -> ADMIN) であるかの確認は、
    // UserService.updateUserRole メソッドで行われる。
    const query = {
      include: { teacher: true, student: true, admin: true },
    };
    const updatedUser = await userService.updateUserRole(
      userNewRole.id,
      userNewRole.newRole,
      query
    );

    return NextResponse.json(
      new SuccessResponseBuilder(updatedUser)
        .setHttpStatus(StatusCodes.OK)
        .build()
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
