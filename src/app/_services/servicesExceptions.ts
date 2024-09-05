import AppErrorCode from "@/app/_types/AppErrorCode";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "@/app/_utils/extendedStatusCodes";
import { ApiError } from "@/app/api/_helpers/apiExceptions";

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
