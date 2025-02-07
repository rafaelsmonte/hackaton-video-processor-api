import { Readable } from 'stream';

export interface IExternalStorageGateway {
  uploadVideo(
    key: string,
    body: Buffer | string | Readable,
    contentType: string,
  ): Promise<string>;
}
