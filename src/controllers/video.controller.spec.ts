import { IMessaging } from '../interfaces/messaging.interface';
import { IDatabase } from '../interfaces/database.interface';
import { IExternalStorage } from '../interfaces/external-storage.interface';
import { VideoUseCases } from '../usecases/video.usecases';
import { VideoAdapter } from '../adapters/video.adapter';
import { VideoController } from './video.controller';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { VideoGateway } from '../gateways/video.gateway';
import { MessagingGateway } from '../gateways/messaging.gateway';
import { ExternalStorageGateway } from '../gateways/external-storage.gateway';

jest.mock('../usecases/video.usecases');
jest.mock('../gateways/video.gateway');
jest.mock('../gateways/messaging.gateway');
jest.mock('../gateways/external-storage.gateway');
jest.mock('../adapters/video.adapter');

describe('VideoController', () => {
  let database: IDatabase;
  let messaging: IMessaging;
  let externalStorage: IExternalStorage;
  let userId: string;

  beforeEach(() => {
    database = {} as IDatabase;
    messaging = {} as IMessaging;
    externalStorage = {} as IExternalStorage;
    userId = 'userId-1';

    (VideoUseCases.findAll as jest.Mock).mockResolvedValue([]);
    (VideoUseCases.findById as jest.Mock).mockResolvedValue(null);
    (VideoUseCases.create as jest.Mock).mockResolvedValue({
      order: { id: 'videoId-1', description: 'video description' },
    });
    (VideoUseCases.delete as jest.Mock).mockResolvedValue(undefined);
    (
      VideoUseCases.handleProcessingMessageReceived as jest.Mock
    ).mockResolvedValue(undefined);
    (VideoUseCases.handleSuccessMessageReceived as jest.Mock).mockResolvedValue(
      undefined,
    );
    (VideoUseCases.handleErrorMessageReceived as jest.Mock).mockResolvedValue(
      undefined,
    );
  });

  describe('findAll', () => {
    it('should return a JSON string with all videos', async () => {
      const mockVideos = [
        {
          id: 'videoId-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T01:00:00Z',
          userId,
          description: 'video description',
          url: 'video url',
          snapshotsUrl: 'video snapshots url',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      ];

      (VideoAdapter.adaptArrayJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockVideos),
      );

      const result = await VideoController.findAll(database, userId);

      expect(result).toBe(JSON.stringify(mockVideos));
      expect(VideoUseCases.findAll).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        userId,
      );
    });
  });

  describe('findById', () => {
    it('should return the details of a specific video', async () => {
      const mockVideo = {
        id: 'videoId-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T01:00:00Z',
        userId,
        description: 'video description',
        url: 'video url',
        snapshotsUrl: 'video snapshots url',
        status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      };

      (VideoAdapter.adaptJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockVideo),
      );

      const result = await VideoController.findById(
        database,
        'videoId-1',
        userId,
      );

      expect(result).toBe(JSON.stringify(mockVideo));
      expect(VideoUseCases.findById).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        'videoId-1',
        userId,
      );
    });
  });

  describe('create', () => {
    it('should create a new video and return JSON', async () => {
      const mockVideo = {
        order: { id: 'videoId-1', description: 'video description' },
      };

      (VideoAdapter.adaptJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockVideo),
      );

      const result = await VideoController.create(
        database,
        messaging,
        externalStorage,
        '',
        '' as any,
        '',
        userId,
        'video description',
      );

      expect(result).toBe(JSON.stringify(mockVideo));
      expect(VideoUseCases.create).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        expect.any(MessagingGateway),
        expect.any(ExternalStorageGateway),
        '',
        '' as any,
        '',
        userId,
        'video description',
      );
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      await VideoController.delete(database, 'videoId-1', userId);

      expect(VideoUseCases.delete).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        'videoId-1',
        userId,
      );
    });
  });

  describe('retry', () => {
    it('should retry video processing', async () => {
      const mockVideo = { id: 'videoId-1' };
      (VideoAdapter.adaptJson as jest.Mock).mockReturnValue(
        JSON.stringify(mockVideo),
      );

      const result = await VideoController.retry(
        database,
        messaging,
        'videoId-1',
        'userId-1',
      );

      expect(result).toBe(JSON.stringify(mockVideo));
      expect(VideoUseCases.retry).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        expect.any(MessagingGateway),
        'videoId-1',
        'userId-1',
      );
    });
  });

  describe('handleProcessingMessageReceived', () => {
    it('should update the status when processing message is received', async () => {
      await VideoController.handleProcessingMessageReceived(
        database,
        'videoId-1',
        'userId-1',
      );

      expect(
        VideoUseCases.handleProcessingMessageReceived,
      ).toHaveBeenCalledWith(expect.any(VideoGateway), 'videoId-1', 'userId-1');
    });
  });

  describe('handleSuccessMessageReceived', () => {
    it('should update the status when success message is received', async () => {
      await VideoController.handleSuccessMessageReceived(
        database,
        messaging,
        'videoId-1',
        'userId-1',
        'video snapshots url',
      );

      expect(VideoUseCases.handleSuccessMessageReceived).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        expect.any(MessagingGateway),
        'videoId-1',
        'userId-1',
        'video snapshots url',
      );
    });
  });

  describe('handleErrorMessageReceived', () => {
    it('should update the status when error message is received', async () => {
      await VideoController.handleErrorMessageReceived(
        database,
        messaging,
        'videoId-1',
        'userId-1',
        'error message',
        'error description',
      );

      expect(VideoUseCases.handleErrorMessageReceived).toHaveBeenCalledWith(
        expect.any(VideoGateway),
        expect.any(MessagingGateway),
        'videoId-1',
        'userId-1',
        'error message',
        'error description',
      );
    });
  });
});
