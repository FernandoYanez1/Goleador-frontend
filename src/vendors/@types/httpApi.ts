export interface TResponseApi<T> {
  success: boolean;
  result: T | null;
  msg: string | null;
}
