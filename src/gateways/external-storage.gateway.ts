import { IExternalStorage } from '../interfaces/external-storage.interface';
import { IExternalStorageGateway } from '../interfaces/external-storage.gateway.interface';
import { Readable } from 'stream';

export class ExternalStorageGateway implements IExternalStorageGateway {
  constructor(private externalStorage: IExternalStorage) {}

  public async uploadVideo(
    key: string,
    body: Buffer | string | Readable,
    contentType: string,
  ): Promise<string> {
    return this.externalStorage.uploadVideo(key, body, contentType);
  }
}
