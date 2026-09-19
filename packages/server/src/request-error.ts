/** Expected validation and lookup errors that are safe to return to API callers. */
export class RequestError extends Error {
  constructor(
    public readonly status: 400 | 404,
    message: string,
  ) {
    super(message);
    this.name = 'RequestError';
  }
}
