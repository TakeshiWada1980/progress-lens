import axios, { AxiosError, AxiosResponse } from "axios";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import ApiRequestHeader from "@/app/_types/ApiRequestHeader";
import { ApiErrorResponse, Origin } from "@/app/_types/ApiResponse";
import AppErrorCode from "@/app/_types/AppErrorCode";

const createGetRequest = <Response>() => {
  return async (
    url: string,
    headers?: ApiRequestHeader
  ): Promise<Response | ApiErrorResponse> => {
    const options = {
      headers,
    };
    let res: AxiosResponse<Response, any> | null = null;
    try {
      res = await axios.get<Response>(url, options);
      res = res as AxiosResponse<Response, any>;
      // 開発環境では、動作検証のためにDelayを設定
      if (isDevelopmentEnv && apiDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, apiDelay));
      }
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
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
      }
      throw error;
    }
  };
};

export default createGetRequest;
