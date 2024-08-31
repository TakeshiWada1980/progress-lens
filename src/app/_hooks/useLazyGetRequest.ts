import axios, { AxiosError, AxiosRequestConfig } from "axios";
import useSWRMutation from "swr/mutation";
import { ApiErrorResponse, ApiResponse } from "@/app/_types/ApiResponse";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import ApiRequestHeader from "@/app/_types/ApiRequestHeader";

const useLazyGetRequest = <T>(url: string, headers?: ApiRequestHeader) => {
  const fetcher = async (url: string) => {
    const options: AxiosRequestConfig = {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    try {
      const response = await axios.get<ApiResponse<T>>(url, options);

      // 開発環境では、動作検証のためにDelayを設定
      if (isDevelopmentEnv && apiDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, apiDelay));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const { trigger, data, error, isMutating } = useSWRMutation<
    ApiResponse<T>,
    AxiosError<ApiErrorResponse>
  >(url, fetcher);

  return {
    invokeGet: trigger,
    payload: data,
    error,
    isLoading: isMutating,
  };
};

export default useLazyGetRequest;
