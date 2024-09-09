import { Role, PrismaClient } from "@prisma/client";
import { Prisma as PRS } from "@prisma/client";
import AppErrorCode from "@/app/_types/AppErrorCode";
import { ApiError } from "@/app/api/_helpers/apiExceptions";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import {
  DomainRuleViolationError,
  withErrorHandling,
} from "@/app/_services/servicesExceptions";

export type UserReturnType<
  T extends PRS.UserInclude,
  U extends PRS.UserSelect
> = {
  include?: T;
  select?: U;
};

export const studentUserSchema = {
  include: { student: true },
} as const;

export const teacherUserSchema = {
  include: { student: true, teacher: true },
} as const;

export const adminUserSchema = {
  include: { admin: true, teacher: true, student: true },
} as const;

export const fullUserSchema = adminUserSchema;

type CreateUserAsStudentReturnType = PRS.UserGetPayload<
  typeof studentUserSchema
>;

// UserのCRUD操作を行なうクラス
//   基本的に、このサービスクラスでは認証や認可の検証処理はしない
//   呼び出す側で、認証・認可を確認して利用すること
class UserService {
  private prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 許可するロールの変更マップ (key: 現在ロール, value: 変更許可ロールの配列)
  private static roleUpdateMap: Partial<Record<Role, Role[]>> = {
    [Role.STUDENT]: [Role.TEACHER],
    [Role.TEACHER]: [Role.ADMIN],
  };

  // ロールの変更が許可されているかどうかを検証
  public static validateRoleChange(currentRole: Role, newRole: Role) {
    const allowedRoles = UserService.roleUpdateMap[currentRole] || [];
    if (!allowedRoles.includes(newRole)) {
      throw new DomainRuleViolationError(
        `許可されていないロールの変更です。${currentRole} -> ${newRole}`
      );
    }
  }

  // IDによるユーザ情報の取得 (該当なしの場合は例外をスロー)
  public async getById<T extends PRS.UserInclude, U extends PRS.UserSelect>(
    id: string,
    options?: UserReturnType<T, U>
  ): Promise<PRS.UserGetPayload<{ include: T; select: U }>> {
    const user = await this.tryGetById(id, options);
    if (!user) {
      throw new UserService.UserNotFoundError(id);
    }
    return user;
  }

  // IDによるユーザ情報の取得 (該当なしの場合は null を返す)
  public async tryGetById<T extends PRS.UserInclude, U extends PRS.UserSelect>(
    id: string,
    options?: UserReturnType<T, U>
  ): Promise<PRS.UserGetPayload<{ include: T; select: U }> | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      ...options,
    })) as PRS.UserGetPayload<{ include: T; select: U }> | null;
  }

  // ユーザ情報（ displayName と avatarImgKey ）の更新
  @withErrorHandling()
  public async update(id: string, data: PRS.UserUpdateInput): Promise<boolean> {
    // avatarImgKey が undefine のときは null に変換
    data.avatarImgKey ??= null;
    await this.prisma.user.update({
      where: { id },
      data: {
        ...{ displayName: data.displayName },
        ...{ avatarImgKey: data.avatarImgKey },
      },
    });
    return true;
  }

  // ユーザ（学生ロール）の新規作成
  @withErrorHandling()
  public async createAsStudent(
    id: string,
    displayName: string
  ): Promise<CreateUserAsStudentReturnType> {
    return await this.prisma.user.create({
      data: {
        id,
        displayName,
        role: Role.STUDENT,
        student: {
          create: {
            reserve1: "student-foo",
            reserve2: "student-bar",
          },
        },
      },
      include: {
        student: true,
      },
    });
  }

  // ロールの昇格（変更）。現状、学生→教員、教員→管理者のみ許可
  @withErrorHandling()
  public async updateRole<T extends PRS.UserInclude, U extends PRS.UserSelect>(
    id: string,
    newRole: Role,
    options?: UserReturnType<T, U>
  ): Promise<PRS.UserGetPayload<{ include: T; select: U }>> {
    const user = await this.getById(id, options);
    if (user.role === newRole) {
      return user;
    }

    // 許可されたロール昇格でなければ DomainRuleViolationError をスロー
    UserService.validateRoleChange(user.role, newRole);

    switch (newRole) {
      case Role.TEACHER:
        return await this.assignToTeacherRole(id, options);
      case Role.ADMIN:
        return await this.assignToAdminRole(id, options);
      default:
        throw Error("予期せぬエラーが発生しました。");
    }
  }

  // ロール昇格（学生→教員）・初期データの設定
  @withErrorHandling()
  private async assignToTeacherRole<
    T extends PRS.UserInclude,
    U extends PRS.UserSelect
  >(
    id: string,
    options?: UserReturnType<T, U>
  ): Promise<PRS.UserGetPayload<{ include: T; select: U }>> {
    await this.prisma.user.update({
      where: { id },
      data: {
        role: Role.TEACHER,
        teacher: {
          create: {
            reserve1: "teacher-foo",
            reserve2: "teacher-bar",
          },
        },
      },
    });
    return await this.getById(id, options);
  }

  // ロール変更（教員→管理者）・初期データの設定
  @withErrorHandling()
  private async assignToAdminRole<
    T extends PRS.UserInclude,
    U extends PRS.UserSelect
  >(
    id: string,
    options?: UserReturnType<T, U>
  ): Promise<PRS.UserGetPayload<{ include: T; select: U }>> {
    await this.prisma.user.update({
      where: { id },
      data: {
        role: Role.ADMIN,
        admin: {
          create: {
            reserve1: "admin-foo",
            reserve2: "admin-bar",
          },
        },
      },
    });
    return await this.getById(id, options);
  }

  public static UserNotFoundError = class extends ApiError {
    readonly httpStatus: StatusCodes = StatusCodes.BAD_REQUEST;
    readonly appErrorCode: string = AppErrorCode.USER_NOT_FOUND;
    readonly origin: Origin = Origin.SERVER;
    readonly technicalInfo: string;
    readonly technicalInfoObject?: any;
    constructor(userId: string) {
      const msg = `ID : '${userId}' に該当するユーザが見つかりませんでした。`;
      super(msg);
      this.technicalInfo = msg;
      this.technicalInfoObject = { userId: userId };
    }
  };
}

export default UserService;
