import { VideoMessage } from '../types/video-message.type';
import { IMessaging } from '../interfaces/messaging.interface';
import { SNS } from 'aws-sdk';

export class SNSMessaging implements IMessaging {
  private readonly snsClient: SNS;

  constructor() {
    if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
      this.snsClient = new SNS({
        region: process.env.AWS_REGION,
        endpoint: 'http://localstack:4566',
      });
    } else {
      this.snsClient = new SNS({ region: process.env.AWS_REGION });
    }
  }

  async publishMessage(message: VideoMessage): Promise<void> {
    const snsMessage: SNS.PublishInput = {
      TopicArn: process.env.VIDEO_API_SNS_TOPIC_ARN,
      Message: JSON.stringify(message),
    };

    try {
      await this.snsClient.publish(snsMessage).promise();
    } catch (error) {
      console.log(`Messaging error: ${error}`);
    }
  }
}
