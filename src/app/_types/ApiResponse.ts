export type Origin = "Client" | "Server";

export const Origin = {
  CLIENT: "Client" as Origin,
  SERVER: "Server" as Origin,
};

export interface ErrorDetails {
  origin: Origin;
  appErrorCode: string;
  technicalInfo: string;
  technicalInfoObject?: any;
}

interface ApiBaseResponse {
  httpStatus: number;
  success: boolean;
  data: unknown;
  error: ErrorDetails | null;
}

export interface ApiSuccessResponse<T> extends ApiBaseResponse {
  success: true;
  data: T;
  error: null;
}

export interface ApiErrorResponse extends ApiBaseResponse {
  success: false;
  data: null;
  error: ErrorDetails;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
