import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Video } from '../entities/video.entity';
import { IDatabase } from '../interfaces/database.interface';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '../errors/database.error';

export class DynamoDatabase implements IDatabase {
  private dynamoDBDocClient: DynamoDBDocumentClient;

  constructor() {
    let dynamoClient: DynamoDBClient;

    if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
      dynamoClient = new DynamoDBClient({
        endpoint: 'http://localstack:4566',
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      dynamoClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }

    this.dynamoDBDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async findAllVideos(): Promise<Video[]> {
    try {
      const params = {
        TableName: 'videos',
      };

      const result = await this.dynamoDBDocClient.send(new ScanCommand(params));

      const videos: Video[] = result.Items.map(
        (video) =>
          new Video(
            video.id,
            new Date(video.createdAt),
            new Date(video.updatedAt),
            video.userId,
            video.name,
            video.description,
            video.url,
            video.snapshotsUrl,
            video.status,
          ),
      );

      return videos;
    } catch (error) {
      console.log('Failed to find all videos due to: ', error);
      throw new DatabaseError('Failed to find all videos');
    }
  }

  async findVideoById(id: string): Promise<Video | null> {
    try {
      const params = {
        TableName: 'videos',
        Key: { id },
      };

      const result = await this.dynamoDBDocClient.send(new GetCommand(params));
      const video = result.Item;

      if (!video) return null;

      return new Video(
        video.id,
        new Date(video.createdAt),
        new Date(video.updatedAt),
        video.userId,
        video.name,
        video.description,
        video.url,
        video.snapshotsUrl,
        video.status,
      );
    } catch (error) {
      console.log('Failed to find a video due to: ', error);
      throw new DatabaseError('Failed to find a video');
    }
  }

  async createVideo(video: Video): Promise<Video> {
    const videoId = uuidv4();
    const now = new Date().toISOString();

    try {
      const params = {
        TableName: 'videos',
        Item: {
          id: videoId,
          createdAt: now,
          updatedAt: now,
          userId: video.getUserId(),
          name: video.getName(),
          description: video.getDescription(),
          url: video.getUrl(),
          snapshotsUrl: video.getSnapshotsUrl(),
          status: video.getStatus(),
        },
      };

      await this.dynamoDBDocClient.send(new PutCommand(params));

      return this.findVideoById(videoId);
    } catch (error) {
      console.log('Failed to create a video due to: ', error);
      throw new DatabaseError('Failed to create a video');
    }
  }

  async updateVideoStatus(video: Video): Promise<Video> {
    try {
      const newStatus = video.getStatus();

      const params = {
        TableName: 'videos',
        Key: { id: video.getId() },
        UpdateExpression: 'SET #status = :newStatus, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':newStatus': newStatus,
          ':updatedAt': new Date().toISOString(),
        },
      };

      await this.dynamoDBDocClient.send(new UpdateCommand(params));

      return this.findVideoById(video.getId());
    } catch (error) {
      console.log('Failed to update video status due to: ', error);
      throw new DatabaseError('Failed to update video status');
    }
  }

  async updateVideoStatusAndSnapshotsUrl(video: Video): Promise<Video> {
    try {
      const newStatus = video.getStatus();
      const newSnapshotsUrl = video.getSnapshotsUrl();

      const params = {
        TableName: 'videos',
        Key: { id: video.getId() },
        UpdateExpression:
          'SET #status = :newStatus, #snapshotsUrl = :newSnapshotsUrl, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#snapshotsUrl': 'snapshotsUrl',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':newStatus': newStatus,
          ':newSnapshotsUrl': newSnapshotsUrl,
          ':updatedAt': new Date().toISOString(),
        },
      };

      await this.dynamoDBDocClient.send(new UpdateCommand(params));

      return this.findVideoById(video.getId());
    } catch (error) {
      console.log(
        'Failed to update video status and snapshots url due to: ',
        error,
      );
      throw new DatabaseError(
        'Failed to update video status and snapshots url',
      );
    }
  }

  async deleteVideo(id: string): Promise<void> {
    try {
      const params = {
        TableName: 'videos',
        Key: {
          id: id,
        },
      };

      await this.dynamoDBDocClient.send(new DeleteCommand(params));
    } catch (error) {
      console.log('Failed to delete a video: ', error);
      throw new DatabaseError('Failed to delete a video');
    }
  }
}
