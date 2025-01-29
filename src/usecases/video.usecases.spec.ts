import { IExternalStorageGateway } from '../interfaces/external-storage.gateway.interface';
import { IVideoGateway } from '../interfaces/video.gateway.interface';
import { IMessagingGateway } from '../interfaces/messaging.gateway.interface';
import { Video } from '../entities/video.entity';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { VideoUseCases } from './video.usecases';
import { VideoNotFoundError } from '../errors/video-not-found.error';

describe('VideoUseCases', () => {
  let mockVideoGateway: jest.Mocked<IVideoGateway>;
  let mockMessagingGateway: jest.Mocked<IMessagingGateway>;
  let mockExternalStorageGateway: jest.Mocked<IExternalStorageGateway>;

  beforeEach(() => {
    mockVideoGateway = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusAndSnapshotsUrl: jest.fn(),
      delete: jest.fn(),
    };
    mockMessagingGateway = {
      publishVideoImageExtractionRequestMessage: jest.fn(),
      publishVideoImageExtractionSuccessMessage: jest.fn(),
      publishVideoImageExtractionErrorMessage: jest.fn(),
    };
    mockExternalStorageGateway = {
      uploadVideo: jest.fn(),
    };
  });

  describe('findAll', () => {
    it('should return a list of videos', async () => {
      const mockVideos: Video[] = [];
      mockVideos.push(
        new Video(
          'videoId-1',
          new Date(),
          new Date(),
          'userId-1',
          'video description',
          'video url',
          'video snapshots url',
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        ),
      );

      mockVideoGateway.findAll.mockResolvedValue(mockVideos);

      const videos = await VideoUseCases.findAll(mockVideoGateway);

      expect(videos).toEqual(mockVideos);
      expect(mockVideoGateway.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no video exist', async () => {
      mockVideoGateway.findAll.mockResolvedValue([]);

      const videos = await VideoUseCases.findAll(mockVideoGateway);

      expect(videos).toEqual([]);
      expect(mockVideoGateway.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return the video if found', async () => {
      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );

      mockVideoGateway.findById.mockResolvedValue(mockVideo);

      const video = await VideoUseCases.findById(mockVideoGateway, 'videoId-1');

      expect(video).toEqual(mockVideo);
      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
      expect(mockVideoGateway.findById).toHaveBeenCalledWith('videoId-1');
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      mockVideoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.findById(mockVideoGateway, 'videoId-2'),
      ).rejects.toThrow(VideoNotFoundError);
      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new video successfully', async () => {
      mockExternalStorageGateway.uploadVideo.mockResolvedValue('video url');

      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );

      mockVideoGateway.create.mockResolvedValue(mockVideo);

      const video = await VideoUseCases.create(
        mockVideoGateway,
        mockMessagingGateway,
        mockExternalStorageGateway,
        '',
        '' as any, // TODO implement this
        '',
        'userId-1',
        'video description',
      );

      expect(video).toEqual(mockVideo);
      expect(mockExternalStorageGateway.uploadVideo).toHaveBeenCalledTimes(1);
      expect(mockVideoGateway.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleProcessingMessageReceived', () => {
    it('should update video status to VIDEO_IMAGE_EXTRACTION_PROCESSING', async () => {
      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
      );

      mockVideoGateway.findById.mockResolvedValue(mockVideo);

      await VideoUseCases.handleProcessingMessageReceived(
        mockVideoGateway,
        'videoId-1',
      );

      expect(mockVideo.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
      );
      expect(mockVideoGateway.updateStatus).toHaveBeenCalledWith(mockVideo);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      mockVideoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleProcessingMessageReceived(
          mockVideoGateway,
          'videoId-1',
        ),
      ).rejects.toThrow(VideoNotFoundError);

      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSuccessMessageReceived', () => {
    it('should update video status to VIDEO_IMAGE_EXTRACTION_SUCCESS', async () => {
      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS,
      );

      mockVideoGateway.findById.mockResolvedValue(mockVideo);

      await VideoUseCases.handleSuccessMessageReceived(
        mockVideoGateway,
        mockMessagingGateway,
        'videoId-1',
        'video snapshots url',
      );

      expect(mockVideo.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS,
      );
      expect(mockVideoGateway.updateStatusAndSnapshotsUrl).toHaveBeenCalledWith(
        mockVideo,
      );
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      mockVideoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleSuccessMessageReceived(
          mockVideoGateway,
          mockMessagingGateway,
          'videoId-1',
          'video snapshots url',
        ),
      ).rejects.toThrow(VideoNotFoundError);

      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleErrorMessageReceived', () => {
    it('should update video status to VIDEO_IMAGE_EXTRACTION_ERROR', async () => {
      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR,
      );

      mockVideoGateway.findById.mockResolvedValue(mockVideo);

      await VideoUseCases.handleErrorMessageReceived(
        mockVideoGateway,
        mockMessagingGateway,
        'videoId-1',
        'error message',
        'error description',
      );

      expect(mockVideo.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR,
      );

      expect(mockVideoGateway.updateStatus).toHaveBeenCalledWith(mockVideo);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      mockVideoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleErrorMessageReceived(
          mockVideoGateway,
          mockMessagingGateway,
          'videoId-1',
          'error message',
          'error description',
        ),
      ).rejects.toThrow(VideoNotFoundError);

      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete an video', async () => {
      const mockVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR,
      );

      mockVideoGateway.findById.mockResolvedValue(mockVideo);

      await VideoUseCases.delete(mockVideoGateway, 'videoId-1');

      expect(mockVideoGateway.delete).toHaveBeenCalledWith('videoId-1');
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      mockVideoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.delete(mockVideoGateway, 'videoId-1'),
      ).rejects.toThrow(VideoNotFoundError);

      expect(mockVideoGateway.findById).toHaveBeenCalledTimes(1);
    });
  });
});
