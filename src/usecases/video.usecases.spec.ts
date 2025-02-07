import { Video } from '../entities/video.entity';
import { IVideoGateway } from '../interfaces/video.gateway.interface';
import { IMessagingGateway } from '../interfaces/messaging.gateway.interface';
import { IExternalStorageGateway } from '../interfaces/external-storage.gateway.interface';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { VideoNotFoundError } from '../errors/video-not-found.error';
import { InvalidVideoImageExtractionStatusError } from '../errors/invalid-video-image-extraction-status.error';
import { VideoFile } from '../entities/video-file.entity';
import { VideoUseCases } from './video.usecases';

const removeTimestamp = (str: string) =>
  str.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '[DATE]');

describe('VideoUseCases', () => {
  let videoGateway: jest.Mocked<IVideoGateway>;
  let messagingGateway: jest.Mocked<IMessagingGateway>;
  let externalStorageGateway: jest.Mocked<IExternalStorageGateway>;

  beforeEach(() => {
    videoGateway = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      updateStatusAndSnapshotsUrl: jest.fn(),
      delete: jest.fn(),
    };

    messagingGateway = {
      publishVideoImageExtractionRequestMessage: jest.fn(),
      publishVideoImageExtractionSuccessMessage: jest.fn(),
      publishVideoImageExtractionErrorMessage: jest.fn(),
    };

    externalStorageGateway = {
      uploadVideo: jest.fn(),
    };
  });

  describe('findAll', () => {
    it('should return all videos for a user', async () => {
      const userId = 'userId-1';
      const videos = [
        Video.new(
          userId,
          'video1.mp4',
          'video description',
          'video url',
          VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
        ),
      ];
      videoGateway.findAll.mockResolvedValue(videos);

      const result = await VideoUseCases.findAll(videoGateway, userId);

      expect(videoGateway.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(videos);
    });
  });

  describe('findById', () => {
    it('should return a video by id', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      );
      videoGateway.findById.mockResolvedValue(video);

      const result = await VideoUseCases.findById(
        videoGateway,
        videoId,
        userId,
      );

      expect(videoGateway.findById).toHaveBeenCalledWith(videoId, userId);
      expect(result).toEqual(video);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      videoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.findById(videoGateway, videoId, userId),
      ).rejects.toThrow(VideoNotFoundError);
    });
  });

  describe('create', () => {
    it('should create a new video and publish a message', async () => {
      const userId = 'userId-1';
      const fileName = 'video.mp4';
      const fileBuffer = Buffer.from('video data');
      const fileMimetype = 'video/mp4';
      const description = 'video description';
      const videoUrl = 'http://storage.com/video.mp4';
      const videoName = `${Date.now()}-${fileName}`;

      const newVideo = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video name',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );
      externalStorageGateway.uploadVideo.mockResolvedValue(videoUrl);
      videoGateway.create.mockResolvedValue(newVideo);

      const result = await VideoUseCases.create(
        videoGateway,
        messagingGateway,
        externalStorageGateway,
        fileName,
        fileBuffer,
        fileMimetype,
        userId,
        description,
      );

      expect(result).toEqual(newVideo);
    });

    it('should delete the video and throw an error if message publishing fails', async () => {
      const userId = 'userId-1';
      const fileName = 'video.mp4';
      const fileBuffer = Buffer.from('video data');
      const fileMimetype = 'video/mp4';
      const description = 'video description';
      const videoUrl = 'http://storage.com/video.mp4';
      const videoName = `${Date.now()}-${fileName}`;
      const newVideo = Video.new(
        userId,
        videoName,
        description,
        videoUrl,
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      );

      externalStorageGateway.uploadVideo.mockResolvedValue(videoUrl);
      videoGateway.create.mockResolvedValue(newVideo);
      messagingGateway.publishVideoImageExtractionRequestMessage.mockImplementation(
        () => {
          throw new Error('Message publishing failed');
        },
      );

      await expect(
        VideoUseCases.create(
          videoGateway,
          messagingGateway,
          externalStorageGateway,
          fileName,
          fileBuffer,
          fileMimetype,
          userId,
          description,
        ),
      ).rejects.toThrow('Message publishing failed');

      expect(videoGateway.delete).toHaveBeenCalledWith(newVideo.getId());
    });
  });

  describe('retry', () => {
    it('should retry video image extraction', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';

      const video = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video name',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR,
      );

      videoGateway.findById.mockResolvedValue(video);
      videoGateway.updateStatus.mockResolvedValue(video);

      const result = await VideoUseCases.retry(
        videoGateway,
        messagingGateway,
        videoId,
        userId,
      );

      expect(
        messagingGateway.publishVideoImageExtractionRequestMessage,
      ).toHaveBeenCalledWith(videoId, video.getName(), userId);
      expect(video.getStatus()).toEqual(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      );
      expect(result).toEqual(video);
    });

    it('should throw InvalidVideoImageExtractionStatusError if video status is not error', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS,
      );
      videoGateway.findById.mockResolvedValue(video);

      await expect(
        VideoUseCases.retry(videoGateway, messagingGateway, videoId, userId),
      ).rejects.toThrow(InvalidVideoImageExtractionStatusError);
    });
  });

  describe('handleProcessingMessageReceived', () => {
    it('should update video status to processing', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      );
      videoGateway.findById.mockResolvedValue(video);

      await VideoUseCases.handleProcessingMessageReceived(
        videoGateway,
        videoId,
        userId,
      );

      expect(video.getStatus()).toEqual(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
      );
      expect(videoGateway.updateStatus).toHaveBeenCalledWith(video);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      videoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleProcessingMessageReceived(
          videoGateway,
          videoId,
          userId,
        ),
      ).rejects.toThrow(VideoNotFoundError);
    });
  });

  describe('handleSuccessMessageReceived', () => {
    it('should update video status to success and publish a success message', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';
      const videoSnapshotsUrl = 'http://storage.com/snapshots.jpg';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
      );
      videoGateway.findById.mockResolvedValue(video);

      await VideoUseCases.handleSuccessMessageReceived(
        videoGateway,
        messagingGateway,
        videoId,
        userId,
        videoSnapshotsUrl,
      );

      expect(video.getStatus()).toEqual(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS,
      );
      expect(video.getSnapshotsUrl()).toEqual(videoSnapshotsUrl);
      expect(
        messagingGateway.publishVideoImageExtractionSuccessMessage,
      ).toHaveBeenCalledWith(
        userId,
        video.getUrl(),
        video.getDescription(),
        videoSnapshotsUrl,
      );
      expect(videoGateway.updateStatusAndSnapshotsUrl).toHaveBeenCalledWith(
        video,
      );
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      const videoSnapshotsUrl = 'http://storage.com/snapshots.jpg';
      videoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleSuccessMessageReceived(
          videoGateway,
          messagingGateway,
          videoId,
          userId,
          videoSnapshotsUrl,
        ),
      ).rejects.toThrow(VideoNotFoundError);
    });
  });

  describe('handleErrorMessageReceived', () => {
    it('should update video status to error and publish an error message', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-1';
      const errorMessage = 'Error processing video';
      const errorDescription = 'An error occurred while processing the video';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
      );
      videoGateway.findById.mockResolvedValue(video);

      await VideoUseCases.handleErrorMessageReceived(
        videoGateway,
        messagingGateway,
        videoId,
        userId,
        errorMessage,
        errorDescription,
      );

      expect(video.getStatus()).toEqual(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR,
      );
      expect(
        messagingGateway.publishVideoImageExtractionErrorMessage,
      ).toHaveBeenCalledWith(
        userId,
        video.getUrl(),
        video.getDescription(),
        errorMessage,
        errorDescription,
      );
      expect(videoGateway.updateStatus).toHaveBeenCalledWith(video);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      const errorMessage = 'Error processing video';
      const errorDescription = 'An error occurred while processing the video';
      videoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.handleErrorMessageReceived(
          videoGateway,
          messagingGateway,
          videoId,
          userId,
          errorMessage,
          errorDescription,
        ),
      ).rejects.toThrow(VideoNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      const video = Video.new(
        userId,
        'video1.mp4',
        'video description',
        'video url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS,
      );
      videoGateway.findById.mockResolvedValue(video);

      await VideoUseCases.delete(videoGateway, videoId, userId);

      expect(videoGateway.delete).toHaveBeenCalledWith(videoId);
    });

    it('should throw VideoNotFoundError if video is not found', async () => {
      const videoId = 'videoId-1';
      const userId = 'userId-123';
      videoGateway.findById.mockResolvedValue(null);

      await expect(
        VideoUseCases.delete(videoGateway, videoId, userId),
      ).rejects.toThrow(VideoNotFoundError);
    });
  });
});
