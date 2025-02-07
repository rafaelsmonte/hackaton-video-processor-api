import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Storage } from './s3-storage.external';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn(),
      };
    }),
    PutObjectCommand: jest.fn(),
  };
});

describe('S3Storage', () => {
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    sendMock = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: sendMock,
    }));
  });

  it('should configure S3 client with localstack in DEVELOPMENT environment', () => {
    process.env.ENVIRONMENT = 'DEVELOPMENT';

    const externalStorage = new S3Storage();
    expect(S3Client).toHaveBeenCalledWith({
      region: 'us-east-1',
      endpoint: 'http://localstack:4566',
      forcePathStyle: true,
    });
  });

  it('should configure S3 client for production environment', () => {
    process.env.ENVIRONMENT = 'PRODUCTION';

    const externalStorage = new S3Storage();
    expect(S3Client).toHaveBeenCalledWith({
      region: 'us-east-1',
    });
  });

  it('should handle undefined environment variable gracefully', () => {
    delete process.env.ENVIRONMENT;

    const externalStorage = new S3Storage();

    expect(S3Client).toHaveBeenCalledWith({
      region: 'us-east-1',
    });
  });

  describe('uploadVideo', () => {
    const bucketName = 'test-bucket';
    const key = 'test-video.mp4';
    const body = Buffer.from('test data');
    const contentType = 'video/mp4';

    it('should upload a video successfully and return the correct URL (DEVELOPMENT)', async () => {
      process.env.ENVIRONMENT = 'DEVELOPMENT';
      const externalStorage = new S3Storage();

      sendMock.mockResolvedValue({});

      const result = await externalStorage.uploadVideo(key, body, contentType);
      expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toBe(`http://localstack:4566/${bucketName}/${key}`);
    });

    it('should upload a video successfully and return the correct URL (PRODUCTION)', async () => {
      process.env.ENVIRONMENT = 'PRODUCTION';
      const externalStorage = new S3Storage();

      sendMock.mockResolvedValue({});

      const result = await externalStorage.uploadVideo(key, body, contentType);
      expect(sendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toBe(
        `https://${bucketName}.s3.us-east-1.amazonaws.com/${key}`,
      );
    });
  });
});
