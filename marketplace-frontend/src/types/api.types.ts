export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
  timestamp: string;
}
