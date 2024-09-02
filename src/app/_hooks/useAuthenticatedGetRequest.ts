import axios, { AxiosError } from "axios";
import useSWR from "swr";
import { ApiErrorResponse, ApiResponse } from "@/app/_types/ApiResponse";
import { isDevelopmentEnv, apiDelay } from "@/config/app-config";
import useAuth from "@/app/_hooks/useAuth";

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
    const res = await axios.get(endpoint, options);
    if (isDevelopmentEnv && apiDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, apiDelay));
    }
    return res.data;
  };

  return useSWR<ApiResponse<T>, AxiosError<ApiErrorResponse>>(
    fetchKey,
    fetcher
  );
};

export default useAuthenticatedGetRequest;
