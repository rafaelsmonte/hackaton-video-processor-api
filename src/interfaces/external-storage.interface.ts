import { Readable } from 'stream';

export interface IExternalStorage {
  uploadVideo(
    bucketName: string,
    key: string,
    body: Buffer | string | Readable,
    contentType: string,
  ): Promise<string>;
}
