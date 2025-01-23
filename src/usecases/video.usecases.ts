import { Video } from '../entities/video.entity';
import { IMessagingGateway } from '../interfaces/messaging.gateway.interface';
import { IVideoGateway } from '../interfaces/video.gateway.interface';
import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { VideoNotFoundError } from '../errors/video-not-found.error';
import { IExternalStorageGateway } from '../interfaces/external-storage.gateway.interface';

export class VideoUseCases {
  static async findAll(videoGateway: IVideoGateway): Promise<Video[]> {
    const videos = await videoGateway.findAll();
    return videos;
  }

  static async findById(
    videoGateway: IVideoGateway,
    id: string,
  ): Promise<Video> {
    const video = await videoGateway.findById(id);

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
    const bucketName = process.env.AWS_S3_BUCKET;
    const key = `videos/${Date.now()}-${fileName}`;
    const videoUrl = await externalStorageGateway.uploadVideo(
      bucketName,
      key,
      fileBuffer,
      fileMimetype,
    );

    const newVideo = await videoGateway.create(
      Video.new(
        userId,
        description,
        videoUrl,
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_REQUESTED,
      ),
    );

    messagingGateway.publishVideoImageExtractionRequestMessage(
      newVideo.getId(),
      videoUrl,
    );

    return newVideo;
  }

  static async handleProcessingMessageReceived(
    videoGateway: IVideoGateway,
    videoId: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId);

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
    videoSnapshotsUrl: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId);

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
    errorMessage: string,
    errorDescription: string,
  ): Promise<void> {
    const video = await videoGateway.findById(videoId);

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

  static async delete(videoGateway: IVideoGateway, id: string): Promise<void> {
    const video = await videoGateway.findById(id);

    if (!video) throw new VideoNotFoundError('Video not found');

    await videoGateway.delete(id);
  }
}
