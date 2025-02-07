import { IExternalStorage } from '../interfaces/external-storage.interface';
import { ExternalStorageGateway } from './external-storage.gateway';

jest.mock('../interfaces/external-storage.interface');

describe('ExternalStorageGateway', () => {
  let externalStorageGateway: ExternalStorageGateway;
  let externalStorageMock: jest.Mocked<IExternalStorage>;

  beforeEach(() => {
    externalStorageMock = {
      uploadVideo: jest.fn(),
    };
    externalStorageGateway = new ExternalStorageGateway(externalStorageMock);
  });

  it('should call uploadVideo to send the video to the external storage', async () => {
    await externalStorageGateway.uploadVideo('key', 'body', 'content type');

    expect(externalStorageMock.uploadVideo).toHaveBeenCalledWith(
      'key',
      'body',
      'content type',
    );
    expect(externalStorageMock.uploadVideo).toHaveBeenCalledTimes(1);
  });
});
