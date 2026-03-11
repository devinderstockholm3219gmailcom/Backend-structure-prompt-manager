// Standard API response wrapper
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Paginated response
export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}