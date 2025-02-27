import { IMessaging } from '../interfaces/messaging.interface';
import { MessagingGateway } from '../gateways/messaging.gateway';
import { VideoGateway } from '../gateways/video.gateway';
import { IDatabase } from '../interfaces/database.interface';
import { IExternalStorage } from '../interfaces/external-storage.interface';
import { ExternalStorageGateway } from '../gateways/external-storage.gateway';
import { VideoAdapter } from '../adapters/video.adapter';
import { VideoUseCases } from '../usecases/video.usecases';

export class VideoController {
  static async findAll(database: IDatabase, userId: string): Promise<string> {
    const videoGateway = new VideoGateway(database);

    const videos = await VideoUseCases.findAll(videoGateway, userId);

    return VideoAdapter.adaptArrayJson(videos);
  }

  static async findById(
    database: IDatabase,
    id: string,
    userId: string,
  ): Promise<string> {
    const videoGateway = new VideoGateway(database);

    const video = await VideoUseCases.findById(videoGateway, id, userId);

    return VideoAdapter.adaptJson(video);
  }

  static async create(
    database: IDatabase,
    messaging: IMessaging,
    externalStorage: IExternalStorage,
    fileName: string,
    fileBuffer: Buffer,
    fileMimetype: string,
    userId: string,
    description: string,
  ): Promise<string> {
    const videoGateway = new VideoGateway(database);
    const messagingGateway = new MessagingGateway(messaging);
    const externalStorageGateway = new ExternalStorageGateway(externalStorage);

    const video = await VideoUseCases.create(
      videoGateway,
      messagingGateway,
      externalStorageGateway,
      fileName,
      fileBuffer,
      fileMimetype,
      userId,
      description,
    );

    return VideoAdapter.adaptJson(video);
  }

  static async retry(
    database: IDatabase,
    messaging: IMessaging,
    id: string,
    userId: string,
  ): Promise<string> {
    const videoGateway = new VideoGateway(database);
    const messagingGateway = new MessagingGateway(messaging);

    const video = await VideoUseCases.retry(
      videoGateway,
      messagingGateway,
      id,
      userId,
    );

    return VideoAdapter.adaptJson(video);
  }

  static async handleProcessingMessageReceived(
    database: IDatabase,
    videoId: string,
    userId: string,
  ): Promise<void> {
    const videoGateway = new VideoGateway(database);

    await VideoUseCases.handleProcessingMessageReceived(
      videoGateway,
      videoId,
      userId,
    );
  }

  static async handleSuccessMessageReceived(
    database: IDatabase,
    messaging: IMessaging,
    videoId: string,
    userId: string,
    snapshotsUrl: string,
  ): Promise<void> {
    const videoGateway = new VideoGateway(database);
    const messagingGateway = new MessagingGateway(messaging);

    await VideoUseCases.handleSuccessMessageReceived(
      videoGateway,
      messagingGateway,
      videoId,
      userId,
      snapshotsUrl,
    );
  }

  static async handleErrorMessageReceived(
    database: IDatabase,
    messaging: IMessaging,
    videoId: string,
    userId: string,
    errorMessage: string,
    errorDescription: string,
  ): Promise<void> {
    const videoGateway = new VideoGateway(database);
    const messagingGateway = new MessagingGateway(messaging);

    await VideoUseCases.handleErrorMessageReceived(
      videoGateway,
      messagingGateway,
      videoId,
      userId,
      errorMessage,
      errorDescription,
    );
  }

  static async delete(
    database: IDatabase,
    videoId: string,
    userId: string,
  ): Promise<void> {
    const videoGateway = new VideoGateway(database);

    await VideoUseCases.delete(videoGateway, videoId, userId);
  }
}
