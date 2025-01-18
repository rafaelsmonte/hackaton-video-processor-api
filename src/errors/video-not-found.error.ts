export class VideoNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VideoNotFoundError';
  }
}
