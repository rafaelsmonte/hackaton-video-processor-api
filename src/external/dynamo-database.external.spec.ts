import { mockClient } from 'aws-sdk-client-mock';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDatabase } from './dynamo-database.external';
import { DatabaseError } from '../errors/database.error';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';

describe('DynamoDatabase', () => {
  const dynamoMock = mockClient(DynamoDBDocumentClient);
  let database: DynamoDatabase;

  beforeEach(() => {
    dynamoMock.reset();
    database = new DynamoDatabase();
  });

  describe('findAllVideos', () => {
    it('should return all videos', async () => {
      dynamoMock.on(ScanCommand).resolves({
        Items: [
          {
            id: 'videoId-1',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T01:00:00Z',
            userId: 'userId-1',
            description: 'video description',
            url: 'video url',
            snapshotsUrl: 'video snapshots url',
            status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
          },
        ],
      });

      const videos = await database.findAllVideos();

      expect(videos).toHaveLength(1);
      expect(videos[0].getId()).toBe('videoId-1');
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

      await expect(database.findAllVideos()).rejects.toThrow(DatabaseError);
    });
  });

  describe('findVideoById', () => {
    it('should return the video by ID', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'videoId-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z',
          userId: 'userId-1',
          description: 'video description',
          url: 'video url',
          snapshotsUrl: 'video snapshots url',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      });

      const video = await database.findVideoById('videoId-1');

      expect(video).not.toBeNull();
      expect(video?.getId()).toBe('videoId-1');
    });

    it('should return null if the video is not found', async () => {
      dynamoMock.on(GetCommand).resolves({});

      const order = await database.findVideoById('order2');

      expect(order).toBeNull();
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(GetCommand).rejects(new Error('DynamoDB error'));

      await expect(database.findVideoById('videoId-1')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('createVideo', () => {
    it('should create a new video and return it', async () => {
      const video = {
        getUserId: () => 'userId-1',
        getDescription: () => 'video description',
        getUrl: () => 'video url',
        getSnapshotsUrl: () => 'video snapshots Url',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      };

      dynamoMock.on(PutCommand).resolves({});

      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'new-videoId',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z',
          userId: 'userId-1',
          description: 'video description',
          url: 'video url',
          snapshotsUrl: 'video snapshots url',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      });

      //When I create an Video
      const createdVideo = await database.createVideo(video as any);

      //Then the result should be not null
      expect(createdVideo).not.toBeNull();
      //And the result's ID should be 'new-videoId'
      expect(createdVideo.getId()).toBe('new-videoId');
      //And the result's Description should be 'video description'
      expect(createdVideo.getDescription()).toBe('video description');
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(PutCommand).rejects(new Error('DynamoDB error'));

      const video = {
        getUserId: () => 'userId-1',
        getDescription: () => 'video description',
        getUrl: () => 'video url',
        getSnapshotsUrl: () => 'video snapshots Url',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      };

      await expect(database.createVideo(video as any)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('updateVideoStatus', () => {
    it('should update the video status and return the updated video', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'videoId-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z',
          userId: 'userId-1',
          description: 'video description',
          url: 'video url',
          snapshotsUrl: 'video snapshots url',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      });

      const video = {
        getId: () => 'videoId-1',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      };

      const updatedVideo = await database.updateVideoStatus(video as any);

      expect(updatedVideo).not.toBeNull();
      expect(updatedVideo.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));

      const video = {
        getId: () => 'videoId-1',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      };

      await expect(database.updateVideoStatus(video as any)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('updateVideoStatusAndSnapshotsUrl', () => {
    it('should update the video status, snapshots url and return the updated video', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'videoId-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z',
          userId: 'userId-1',
          description: 'video description',
          url: 'video url',
          snapshotsUrl: 'video snapshots url',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      });

      const video = {
        getId: () => 'videoId-1',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        getSnapshotsUrl: () => 'video snapshots url',
      };

      const updatedVideo = await database.updateVideoStatusAndSnapshotsUrl(
        video as any,
      );

      expect(updatedVideo).not.toBeNull();
      expect(updatedVideo.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );
      expect(updatedVideo.getSnapshotsUrl()).toBe('video snapshots url');
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));

      const video = {
        getId: () => 'videoId-1',
        getStatus: () =>
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        getSnapshotsUrl: () => 'video snapshots url',
      };

      await expect(
        database.updateVideoStatusAndSnapshotsUrl(video as any),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteVideo', () => {
    it('should delete an video by ID', async () => {
      dynamoMock.on(DeleteCommand).resolves({});

      await expect(database.deleteVideo('videoId-1')).resolves.toBeUndefined();
    });

    it('should throw a DatabaseError on failure', async () => {
      dynamoMock.on(DeleteCommand).rejects(new Error('DynamoDB error'));

      await expect(database.deleteVideo('videoId-1')).rejects.toThrow(
        DatabaseError,
      );
    });
  });
});
