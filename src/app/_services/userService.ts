import { Role, PrismaClient } from "@prisma/client";
import { Prisma as P } from "@prisma/client";
import AppErrorCode from "@/app/_types/AppErrorCode";
import { ApiError } from "@/app/api/_helpers/apiExceptions";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import type { UserQueryOptions } from "@/app/_types/ServiceTypes";
import type { Prisma } from "@prisma/client";

type UserWithStudent = P.UserGetPayload<{ include: { student: true } }>;

// 例外処理のためのエラーハンドリングデコレータ
const handleErrors = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: unknown) {
        let msg = `Error in UserService.${propertyKey}`;
        if (error instanceof Error) {
          msg += `: ${error.message}`;
        } else if (error !== null && error !== undefined) {
          msg += `: ${String(error)}`;
        }
        throw new UserService.DatabaseOperationError(msg, error);
      }
    };

    return descriptor;
  };
};

// Userサービスクラス
class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findUserById<
    T extends Prisma.UserInclude,
    U extends Prisma.UserSelect
  >(
    id: string,
    options?: UserQueryOptions<T, U>
  ): Promise<Prisma.UserGetPayload<{ include: T; select: U }>> {
    const user = await this.tryFindUserById(id, options);
    if (!user) {
      throw new UserService.NotFoundError(id);
    }
    return user;
  }

  @handleErrors()
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

  @handleErrors()
  public async updateUser(
    id: string,
    data: P.UserUpdateInput
  ): Promise<boolean> {
    // avatarImgKey が undefine 場合は null に変換
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

  @handleErrors()
  public async createUserWithStudent(
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

  public static NotFoundError = class extends ApiError {
    readonly httpStatus: StatusCodes = StatusCodes.BAD_REQUEST;
    readonly appErrorCode: string = AppErrorCode.USER_NOT_FOUND;
    readonly origin: Origin = Origin.SERVER;
    readonly technicalInfo: string;
    readonly technicalInfoObject?: any;
    constructor(userId: string) {
      const msg = `Users テーブルに ID='${userId}' に該当するユーザが見つかりませんでした。`;
      super(msg);
      this.technicalInfo = msg;
      this.technicalInfoObject = { userId: userId };
    }
  };

  public static DatabaseOperationError = class extends ApiError {
    readonly httpStatus: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR;
    readonly appErrorCode: string = AppErrorCode.DB_OPERATION_ERROR;
    readonly origin: Origin = Origin.SERVER;
    readonly technicalInfo: string;
    readonly technicalInfoObject?: any;
    constructor(msg: string, obj?: any) {
      super(msg);
      this.technicalInfo = msg;
      this.technicalInfoObject = obj;
    }
  };
}

export default UserService;
