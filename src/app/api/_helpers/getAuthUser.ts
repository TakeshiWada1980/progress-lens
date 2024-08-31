import { supabase } from "@/lib/supabase";
import AppErrorCode from "@/app/_types/AppErrorCode";
import { User as AuthUser } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { ApiError } from "./apiExceptions";
import { Origin } from "@/app/_types/ApiResponse";
import { StatusCodes } from "http-status-codes";

export const getAuthUser = async (req: NextRequest): Promise<AuthUser> => {
  const token = req.headers.get("Authorization");
  if (!token) {
    throw new InvalidTokenError(req.headers);
  }
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    throw new InvalidTokenError(error);
  }
  return data.user;
};

export const InvalidTokenError = class extends ApiError {
  readonly httpStatus: StatusCodes = StatusCodes.UNAUTHORIZED;
  readonly appErrorCode: string = AppErrorCode.INVALID_TOKEN;
  readonly origin: Origin = Origin.CLIENT;
  readonly technicalInfo: string;
  readonly technicalInfoObject?: any;

  constructor(obj?: any) {
    const msg = "リクエストヘッダの Authorization は不正なトークンです";
    super(msg);
    this.technicalInfo = msg;
    this.technicalInfoObject = obj;
  }
};

// export const BadRequestError = class extends BackendError {
//   readonly appErrorCode: string = AppErrorCode.BAD_REQUEST_BODY;
//   readonly origin: Origin = Origin.CLIENT;
//   readonly technicalInfo: string;
//   readonly technicalInfoObject?: any;
//   constructor(msg: string, obj?: any) {
//     super(msg);
//     this.technicalInfo = msg;
//     this.technicalInfoObject = obj;
//   }
// };
