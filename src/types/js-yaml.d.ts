declare module 'js-yaml' {
  export function load<T = unknown>(input: string): T;
  export function safeLoad<T = unknown>(input: string): T;
  export function dump<T = unknown>(input: T, options?: {
    indent?: number;
    lineWidth?: number;
    noRefs?: boolean;
    sortKeys?: boolean;
  }): string;
  const _default: unknown;
  export default _default;
}
