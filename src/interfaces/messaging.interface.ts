import { VideoMessage } from '../types/video-message.type';

export interface IMessaging {
  publishMessage(message: VideoMessage): Promise<void>;
}
