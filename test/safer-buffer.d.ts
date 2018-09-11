declare module 'safer-buffer' {
  type SaferBuffer = {
    Buffer: typeof Buffer,
    from: typeof Buffer.from,
  };
  export = SaferBuffer;
}
