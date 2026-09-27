export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  meta?: ApiPaginationMeta;
  error?: ApiErrorEnvelope;
}

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}
