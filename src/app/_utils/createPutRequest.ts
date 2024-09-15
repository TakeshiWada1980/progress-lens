import axios, { AxiosError, AxiosResponse } from "axios";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import ApiRequestHeader from "@/app/_types/ApiRequestHeader";
import { ApiErrorResponse, Origin } from "@/app/_types/ApiResponse";
import AppErrorCode from "@/app/_types/AppErrorCode";

const createPutRequest = <RequestBody, Response>() => {
  return async (
    url: string,
    data: RequestBody,
    headers?: ApiRequestHeader
  ): Promise<Response | ApiErrorResponse> => {
    // useAuth が初期化中である場合に備えた処理
    // isAuthHeaderValid が true になるのは、headers が undefined か、
    // headers.Authorization が null や undefined でない場合
    const isAuthHeaderValid =
      headers === undefined || headers?.Authorization != null;
    if (!isAuthHeaderValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        data: null,
        error: {
          origin: Origin.CLIENT,
          appErrorCode: AppErrorCode.INVALID_HTTP_HEADER,
          technicalInfo:
            "引数 headers に { Authorization : null } が含まれるため意図的に通信を遮断しました。useAuthが初期中の可能性があります。",
          technicalInfoObject: { headers },
        },
        httpStatus: 400,
      };
      return errorResponse;
    }

    const options = headers ? { headers } : {};
    let res: AxiosResponse<Response, any> | null = null;
    try {
      res = await axios.put<Response>(url, data, options);
      res = res as AxiosResponse<Response, any>;
      // 開発環境では、動作検証のためにDelayを設定
      if (isDevelopmentEnv && apiDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, apiDelay));
      }
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // バックエンドからの情報ある場合
        if (error?.response?.data) {
          return error.response.data;
        }

        // バックエンドからの情報がない場合
        const errorResponse: ApiErrorResponse = {
          success: false,
          data: null,
          error: {
            origin: Origin.CLIENT,
            appErrorCode: AppErrorCode.AXIOS_ERROR,
            technicalInfo: error.message,
            technicalInfoObject: error,
          },
          httpStatus: error.response?.status || 400,
        };
        return errorResponse;
      }
      throw error;
    }
  };
};

export default createPutRequest;
