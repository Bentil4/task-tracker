export interface IApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface IApiErrorPayload {
  message: string;
  stack?: string;
}

export interface IApiErrorResponse {
  success: false;
  error: IApiErrorPayload;
}
