import axios, { AxiosError, AxiosRequestConfig } from "axios";
import useSWRMutation from "swr/mutation";
import { ApiErrorResponse, ApiResponse } from "@/app/_types/ApiResponse";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import useAuth from "@/app/_hooks/useAuth";

const useLazyGetRequest = <T>(endpoint: string) => {
  const { apiRequestHeader: headers } = useAuth();

  // この処理の必要性は useAuthenticatedGetRequest.ts を参照
  const isAuthHeaderValid = !!headers?.Authorization;
  const fetchKey = isAuthHeaderValid ? endpoint : null;

  const fetcher = async (endpoint: string) => {
    const options: AxiosRequestConfig = {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    try {
      const response = await axios.get<ApiResponse<T>>(endpoint, options);
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
  >(fetchKey, fetcher);

  return {
    invokeGet: trigger,
    payload: data,
    error,
    isLoading: isMutating,
  };
};

export default useLazyGetRequest;
