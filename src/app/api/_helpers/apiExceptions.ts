import AppErrorCode from "@/app/_types/AppErrorCode";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";

// 基本となるカスタムエラークラス
export abstract class ApiError extends Error {
  readonly httpStatus: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR;
  readonly appErrorCode?: string;
  readonly origin?: Origin;
  readonly technicalInfo?: string;
  readonly technicalInfoObject?: any;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const NonAdminOperationError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.FORBIDDEN;
  readonly appErrorCode: string = AppErrorCode.NOT_ADMIN;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject: any;
  constructor(userId: string, displayName: string) {
    const msg = `管理者権限が必要な操作です。${displayName} (ID: ${userId}) は管理者ではありません。`;
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = { userId, displayName };
  }
};

export const NonTeacherOperationError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.FORBIDDEN;
  readonly appErrorCode: string = AppErrorCode.NOT_TEACHER;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject: any;
  constructor(userId: string, displayName: string) {
    const msg = `教員権限が必要な操作です。${displayName} (ID: ${userId}) は教員ではありません。`;
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = { userId, displayName };
  }
};

export const BadRequestError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.BAD_REQUEST;
  readonly appErrorCode: string = AppErrorCode.BAD_REQUEST_BODY;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject?: any;
  constructor(msg: string, obj?: any) {
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = obj;
  }
};

export const ZodValidationError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.BAD_REQUEST;
  readonly appErrorCode: string = AppErrorCode.BAD_REQUEST_BODY;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject?: any;
  constructor(msg: string, obj?: any) {
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = obj;
  }
};
