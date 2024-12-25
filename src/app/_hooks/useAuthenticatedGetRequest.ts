import axios, { AxiosError, AxiosResponse } from "axios";
import useSWR from "swr";
import {
  ApiErrorResponse,
  ApiResponse,
  Origin,
} from "@/app/_types/ApiResponse";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import useAuth from "@/app/_hooks/useAuth";
import AppErrorCode from "@/app/_types/AppErrorCode";

const useAuthenticatedGetRequest = <T>(endpoint: string) => {
  // タイミングによっては（特に当該ページでブラウザがリロードされたときには）、
  // useAuth が初期化中で、一時的に apiRequestHeader として
  // undefine や { Authorization : null } を返すことがある。
  // このとき、通信は絶対に失敗する (401) になるため、そもそも fetch を実行しないようにする。
  const { apiRequestHeader: headers } = useAuth();
  const isAuthHeaderValid = !!headers?.Authorization;
  const fetchKey = isAuthHeaderValid ? endpoint : null;

  const fetcher = async (endpoint: string) => {
    const options = {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    // const res = await axios.get(endpoint, options);
    // if (isDevelopmentEnv && apiDelay > 0) {
    //   await new Promise((resolve) => setTimeout(resolve, apiDelay));
    // }
    // return res.data;

    let res: AxiosResponse<Response, any> | null = null;
    try {
      res = await axios.get<Response>(endpoint, options);
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

  return useSWR<ApiResponse<T>, AxiosError<ApiErrorResponse>>(
    fetchKey,
    fetcher
  );
};

export default useAuthenticatedGetRequest;
