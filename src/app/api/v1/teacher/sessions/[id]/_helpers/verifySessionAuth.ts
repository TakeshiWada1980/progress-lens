// APIリクエスト・レスポンス関係
import { NextRequest } from "next/server";
import { NonTeacherOperationError } from "@/app/api/_helpers/apiExceptions";

// ユーザ認証・サービスクラス関係
import { getAuthUser } from "@/app/api/_helpers/getAuthUser";
import UserService, { teacherUserSchema } from "@/app/_services/userService";
import SessionService from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";

// 型定義・データ検証関連
import { Role } from "@/app/_types/UserTypes";
import { DomainRuleViolationError } from "@/app/_services/servicesExceptions";

// [共通] セッションの所有権と操作権限を確認
export const verifySessionOwnershipAndPermissions = async (
  req: NextRequest,
  sessionId: string,
  userService: UserService,
  sessionService: SessionService
): Promise<{
  appUser: PRS.UserGetPayload<typeof teacherUserSchema>;
  session: any;
}> => {
  // トークンが不正なときは InvalidTokenError がスローされる
  const authUser = await getAuthUser(req);

  // ユーザが存在しない場合は UserService.NotFoundError がスローされる
  const appUser = await userService.getById(authUser.id, teacherUserSchema);

  // ユーザーが 教員 または 管理者 のロールを持たない場合は Error がスローされる
  if (appUser.role === Role.STUDENT) {
    throw new NonTeacherOperationError(appUser.id, appUser.displayName);
  }

  // セッションが存在しない場合は Error がスローされる
  const session = await sessionService.getById(sessionId);

  // セッションが appUser の所有であるかを確認
  if (session.teacherId !== appUser.id) {
    throw new DomainRuleViolationError(
      `${appUser.displayName} は、SessionID: ${sessionId} の操作権限を持ちません。`,
      { userId: appUser.id, userDisplayName: appUser.displayName, sessionId }
    );
  }

  return { appUser, session };
};
