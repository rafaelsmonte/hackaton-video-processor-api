import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IExternalStorage } from '../interfaces/external-storage.interface';
import { Readable } from 'stream';

export class S3Storage implements IExternalStorage {
  private s3Client: S3Client;

  constructor() {
    if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
      this.s3Client = new S3Client({
        endpoint: 'http://localstack:4566',
        region: process.env.AWS_S3_REGION,
        forcePathStyle: true, // required for LocalStack
      });
    } else {
      this.s3Client = new S3Client({
        region: process.env.AWS_S3_REGION,
      });
    }
  }

  async uploadVideo(
    key: string,
    body: Buffer | string | Readable,
    contentType: string,
  ): Promise<string> {
    const bucketName = process.env.AWS_S3_BUCKET;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      // Return the public URL or just success metadata
      const bucketEndpoint =
        process.env.ENVIRONMENT === 'DEVELOPMENT'
          ? `http://localstack:4566/${bucketName}/${key}` // LocalStack URL format
          : `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

      return bucketEndpoint;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }
}
