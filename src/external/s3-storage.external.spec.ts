import { S3Client } from '@aws-sdk/client-s3';
import { S3Storage } from './s3-storage.external';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn(),
      };
    }),
  };
});

describe('S3Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
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
});
