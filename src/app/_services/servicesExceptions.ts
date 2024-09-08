import AppErrorCode from "@/app/_types/AppErrorCode";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

// 共通の例外処理のためのエラーハンドリングデコレータ
export const withErrorHandling = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          throw error;
        }
        const className = this.constructor.name;
        let msg = `Error in ${className}.${propertyKey}: `;
        if (error instanceof Error) {
          msg += error.message;
        } else if (error !== null && error !== undefined) {
          msg += String(error);
        }
        throw new DatabaseOperationError(msg, error);
      }
    };

    return descriptor;
  };
};

export const DomainRuleViolationError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.BAD_REQUEST;
  readonly appErrorCode: string = AppErrorCode.DOMAIN_RULE_VIOLATION;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject?: any;
  constructor(msg: string, obj?: any) {
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = obj;
  }
};

export const DatabaseOperationError = class extends ApiError {
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
