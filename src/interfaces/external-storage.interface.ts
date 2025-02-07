import { Readable } from 'stream';

export interface IExternalStorage {
  uploadVideo(
    key: string,
    body: Buffer | string | Readable,
    contentType: string,
  ): Promise<string>;
}
