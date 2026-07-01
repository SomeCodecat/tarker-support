export interface DataResult<T> {
  /** The data to render — live when available, otherwise the sample fixture. */
  data: T;
  /** True when `data` is the fallback sample fixture rather than live data. */
  degraded: boolean;
}
