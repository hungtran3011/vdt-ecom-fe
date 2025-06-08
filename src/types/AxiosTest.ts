export interface AxiosTestResponse {
  message?: string;
  data?: Record<string, unknown>;
  issuer?: string;
  tokenValid?: boolean;
  [key: string]: unknown;
}

export interface AxiosTestError {
  message: string;
  status?: number;
  data?: unknown;
}
