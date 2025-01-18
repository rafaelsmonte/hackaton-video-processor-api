import { IMessagingGateway } from '../interfaces/messaging.gateway.interface';
import { IMessaging } from '../interfaces/messaging.interface';
import { MessageType } from '../enum/message-type.enum';
import { MessageSender } from '../enum/message-sender.enum';
import { MessageTarget } from '../enum/message-target.enum';
import { VideoMessage } from 'src/types/video-message.type';

export class MessagingGateway implements IMessagingGateway {
  constructor(private messaging: IMessaging) {}

  async publishVideoImageExtractionRequestMessage(
    videoId: string,
    videoUrl: string,
  ): Promise<void> {
    const message: VideoMessage = {
      type: MessageType.MSG_EXTRACT_SNAPSHOT,
      sender: MessageSender.VIDEO_API_SERVICE,
      target: MessageTarget.VIDEO_IMAGE_PROCESSOR_SERVICE,
      payload: {
        videoId,
        videoUrl,
      },
    };

    this.messaging.publishMessage(message);
  }

  async publishVideoImageExtractionSuccessMessage(
    userId: number,
    videoUrl: string,
    videoSnapshotsUrl: string,
  ): Promise<void> {
    const message: VideoMessage = {
      type: MessageType.MSG_SEND_SNAPSHOT_EXTRACTION_SUCCESS,
      sender: MessageSender.VIDEO_API_SERVICE,
      target: MessageTarget.EMAIL_SERVICE,
      payload: {
        userId,
        videoUrl,
        videoSnapshotsUrl,
      },
    };

    this.messaging.publishMessage(message);
  }

  async publishVideoImageExtractionErrorMessage(
    userId: number,
    videoUrl: string,
    errorMessage: string,
    errorDescription: string,
  ): Promise<void> {
    const message: VideoMessage = {
      type: MessageType.MSG_SEND_SNAPSHOT_EXTRACTION_ERROR,
      sender: MessageSender.VIDEO_API_SERVICE,
      target: MessageTarget.EMAIL_SERVICE,
      payload: {
        userId,
        videoUrl,
        errorMessage,
        errorDescription,
      },
    };

    this.messaging.publishMessage(message);
  }
}
