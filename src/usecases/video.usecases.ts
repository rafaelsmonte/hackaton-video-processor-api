import { Video } from '../entities/video.entity';
import { IMessagingGateway } from '../interfaces/messaging.gateway.interface';
import { IVideoGateway } from '../interfaces/video.gateway.interface';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { VideoNotFoundError } from '../errors/video-not-found.error';
import { IExternalStorageGateway } from '../interfaces/external-storage.gateway.interface';
import { VideoFile } from '../entities/video-file.entity';
import { InvalidVideoImageExtractionStatusError } from '../errors/invalid-video-image-extraction-status.error';

export class VideoUseCases {
  static async findAll(
    videoGateway: IVideoGateway,
    userId: string,
  ): Promise<Video[]> {
    const videos = await videoGateway.findAll(userId);
    return videos;
  }

  static async findById(
    videoGateway: IVideoGateway,
    id: string,
    userId: string,
  ): Promise<Video> {
    const video = await videoGateway.findById(id, userId);

    if (!video) throw new VideoNotFoundError('Video not found');

    return video;
  }

  static async create(
    videoGateway: IVideoGateway,
    messagingGateway: IMessagingGateway,
    externalStorageGateway: IExternalStorageGateway,
    fileName: string,
    fileBuffer: Buffer,
    fileMimetype: string,
    userId: string,
    description: string,
  ): Promise<Video> {
    const newVideoFile = VideoFile.new(fileName, fileBuffer, fileMimetype);

    const videoName = `${Date.now()}-${newVideoFile.getFileName()}`;

    const videoUrl = await externalStorageGateway.uploadVideo(
      `${userId}/${videoName}`,
      newVideoFile.getFileBuffer(),
      newVideoFile.getFileMimetype(),
    );

    const newVideo = await videoGateway.create(
      Video.new(
        userId,
        videoName,
        description,
        videoUrl,
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      ),
    );

    try {
      messagingGateway.publishVideoImageExtractionRequestMessage(
        newVideo.getId(),
        videoName,
        userId,
      );
    } catch (error) {
      await videoGateway.delete(newVideo.getId());
      throw error;
    }

    return newVideo;
  }

  static async retry(
    videoGateway: IVideoGateway,
    messagingGateway: IMessagingGateway,
    id: string,
    userId: string,
  ): Promise<Video> {
    const video = await videoGateway.findById(id, userId);

    if (
      video.getStatus() !==
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR
    ) {
      throw new InvalidVideoImageExtractionStatusError(
        'Video status must be error to be retried',
      );
    }

    messagingGateway.publishVideoImageExtractionRequestMessage(
      video.getId(),
      video.getName(),
      video.getUserId(),
    );

    video.setStatus(
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
    );

    const updatedVideo = videoGateway.updateStatus(video);

    return updatedVideo;
  }

  static async handleProcessingMessageReceived(
    videoGateway: IVideoGateway,
    videoId: string,
    userId: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId, userId);

    if (!video) throw new VideoNotFoundError('Video not found');

    video.setStatus(
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
    );

    await videoGateway.updateStatus(video);
  }

  static async handleSuccessMessageReceived(
    videoGateway: IVideoGateway,
    messagingGateway: IMessagingGateway,
    videoId: string,
    userId: string,
    videoSnapshotsUrl: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId, userId);

    if (!video) throw new VideoNotFoundError('Video not found');

    video.setStatus(VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_SUCCESS);
    video.setSnapshotsUrl(videoSnapshotsUrl);

    messagingGateway.publishVideoImageExtractionSuccessMessage(
      video.getUserId(),
      video.getUrl(),
      video.getDescription(),
      videoSnapshotsUrl,
    );

    await videoGateway.updateStatusAndSnapshotsUrl(video);
  }

  static async handleErrorMessageReceived(
    videoGateway: IVideoGateway,
    messagingGateway: IMessagingGateway,
    videoId: string,
    userId: string,
    errorMessage: string,
    errorDescription: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId, userId);

    if (!video) throw new VideoNotFoundError('Video not found');

    video.setStatus(VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_ERROR);

    messagingGateway.publishVideoImageExtractionErrorMessage(
      video.getUserId(),
      video.getUrl(),
      video.getDescription(),
      errorMessage,
      errorDescription,
    );

    await videoGateway.updateStatus(video);
  }

  static async delete(
    videoGateway: IVideoGateway,
    id: string,
    userId: string,
  ): Promise<void> {
    const video = await videoGateway.findById(id, userId);

    if (!video) throw new VideoNotFoundError('Video not found');

    await videoGateway.delete(id);
  }
}
