import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/app/_types/ApiResponse";

const composeApiErrorMsg = (error: AxiosError<ApiErrorResponse>): string => {
  const resBody = error.response?.data;

  if (!resBody) {
    return error.message; // Axiosによるエラーメッセージ
  }

  const status = error.response?.status;
  const statusText = error.response?.statusText;
  const appErrorCode = resBody.error?.appErrorCode;
  const technicalInfo = resBody.error?.technicalInfo;
  return `[${status}] ${statusText}<br>(AppErrorCode: ${appErrorCode})<br>${technicalInfo}`;
};

export default composeApiErrorMsg;
