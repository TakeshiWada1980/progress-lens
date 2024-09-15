import axios, { AxiosError, AxiosResponse, Method } from "axios";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import ApiRequestHeader from "@/app/_types/ApiRequestHeader";
import { ApiErrorResponse, Origin } from "@/app/_types/ApiResponse";
import AppErrorCode from "@/app/_types/AppErrorCode";

type HttpMethod = "get" | "post" | "put" | "delete";

const createRequest = <RequestBody = any, Response = any>(
  method: HttpMethod
) => {
  return async (
    url: string,
    dataOrHeaders?: RequestBody | ApiRequestHeader,
    headers?: ApiRequestHeader
  ): Promise<Response | ApiErrorResponse> => {
    let data: RequestBody | undefined;
    let requestHeaders: ApiRequestHeader | undefined;

    if (method === "get" || method === "delete") {
      requestHeaders = dataOrHeaders as ApiRequestHeader;
    } else {
      data = dataOrHeaders as RequestBody;
      requestHeaders = headers;
    }

    const isAuthHeaderValid =
      requestHeaders === undefined || requestHeaders?.Authorization != null;

    if (!isAuthHeaderValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        data: null,
        error: {
          origin: Origin.CLIENT,
          appErrorCode: AppErrorCode.INVALID_HTTP_HEADER,
          technicalInfo:
            "引数 headers に { Authorization : null } が含まれるため意図的に通信を遮断しました。useAuthが初期中の可能性があります。",
          technicalInfoObject: { headers: requestHeaders },
        },
        httpStatus: 400,
      };
      return errorResponse;
    }

    const options = {
      method: method as Method,
      url,
      headers: requestHeaders,
      ...(method !== "get" && method !== "delete" && { data }),
    };

    try {
      const res: AxiosResponse<Response> = await axios(options);

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

export const createGetRequest = <Response>() =>
  createRequest<never, Response>("get");
export const createPostRequest = <RequestBody, Response>() =>
  createRequest<RequestBody, Response>("post");
export const createPutRequest = <RequestBody, Response>() =>
  createRequest<RequestBody, Response>("put");
export const createDeleteRequest = <Response>() =>
  createRequest<never, Response>("delete");
