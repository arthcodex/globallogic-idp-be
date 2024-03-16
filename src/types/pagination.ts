export type PaginatedResponse<T> = {
  data: T[];
  totalPages: number;
  page: number;
};
