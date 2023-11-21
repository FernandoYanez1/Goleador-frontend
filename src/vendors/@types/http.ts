export interface TResponse<T> {
  succeeded: boolean;
  data: T | null;
  message: string | null;
}
