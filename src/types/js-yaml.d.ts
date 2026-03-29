declare module 'js-yaml' {
  export function load<T = unknown>(input: string): T;
  export function safeLoad<T = unknown>(input: string): T;
  const _default: unknown;
  export default _default;
}
