import { Role, PrismaClient } from "@prisma/client";
import { Prisma as P } from "@prisma/client";
import AppErrorCode from "@/app/_types/AppErrorCode";
import { ApiError } from "@/app/api/_helpers/apiExceptions";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import type { UserQueryOptions } from "@/app/_types/ServiceTypes";
import type { Prisma, User } from "@prisma/client";
import {
  DomainRuleViolationError,
  DatabaseOperationError,
} from "@/app/_services/servicesExceptions";

type UserWithStudent = P.UserGetPayload<{ include: { student: true } }>;

// 例外処理のためのエラーハンドリングデコレータ
const handleErrors = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          throw error;
        }
        let msg = `Error in UserService.${propertyKey}`;
        if (error instanceof Error) {
          msg += `: ${error.message}`;
        } else if (error !== null && error !== undefined) {
          msg += `: ${String(error)}`;
        }
        throw new DatabaseOperationError(msg, error);
      }
    };

    return descriptor;
  };
};

// Userサービスクラス
// 基本的に、このサービスクラスのなかでは認証や認可の処理は行わない
// 呼び出す側で、認証や認可を完了させておくこと
class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // IDによるユーザ情報の取得 (該当なしの場合は例外をスロー)
  public async findUserById<
    T extends Prisma.UserInclude,
    U extends Prisma.UserSelect
  >(
    id: string,
    options?: UserQueryOptions<T, U>
  ): Promise<Prisma.UserGetPayload<{ include: T; select: U }>> {
    const user = await this.tryFindUserById(id, options);
    if (!user) {
      throw new UserService.UserNotFoundError(id);
    }
    return user;
  }

  // IDによるユーザ情報の取得 (該当なしの場合は null を返す)
  public async tryFindUserById<
    T extends Prisma.UserInclude,
    U extends Prisma.UserSelect
  >(
    id: string,
    options?: UserQueryOptions<T, U>
  ): Promise<Prisma.UserGetPayload<{ include: T; select: U }> | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      ...options,
    })) as P.UserGetPayload<{ include: T; select: U }> | null;
  }

  // ユーザ情報（ displayName と avatarImgKey ）の更新
  @handleErrors()
  public async updateUser(
    id: string,
    data: P.UserUpdateInput
  ): Promise<boolean> {
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

  // ユーザ（ 学生ロール ）の新規作成
  @handleErrors()
  public async createUserAsStudent(
    id: string,
    displayName: string
  ): Promise<UserWithStudent> {
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

  // ロールの変更。学生→教員、教員→管理者の変更のみを許可
  @handleErrors()
  public async updateUserRole<
    T extends Prisma.UserInclude,
    U extends Prisma.UserSelect
  >(
    id: string,
    newRole: Role,
    options?: UserQueryOptions<T, U>
  ): Promise<Prisma.UserGetPayload<{ include: T; select: U }>> {
    const user = await this.findUserById(id, options);
    if (user.role === newRole) {
      return user;
    }

    if (user.role === Role.STUDENT && newRole === Role.TEACHER) {
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
    } else if (user.role === Role.TEACHER && newRole === Role.ADMIN) {
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
    } else {
      throw new DomainRuleViolationError(
        `許可されていないロールの変更です。${user.role} -> ${newRole}`
      );
    }

    return await this.findUserById(id, options);
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
