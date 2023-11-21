export interface PagedResult<T> {
  page: number;
  pageSize: number;
  items: T[] | [];
  totalItems: number;
}
