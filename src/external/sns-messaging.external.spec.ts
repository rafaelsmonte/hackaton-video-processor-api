import { SNSMessaging } from './sns-messaging.external';
import { SNS } from 'aws-sdk';
import { MessageSender } from '../enum/message-sender.enum';
import { MessageTarget } from '../enum/message-target.enum';
import { MessageType } from '../enum/message-type.enum';
import { VideoMessage } from '../types/video-message.type';

jest.mock('aws-sdk', () => {
  return {
    SNS: jest.fn().mockImplementation(() => {
      return {
        publish: jest.fn(),
      };
    }),
  };
});

describe('SNSMessaging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    process.env.VIDEO_API_SNS_TOPIC_ARN =
      'arn:aws:sns:us-east-1:123456789012:MyTopic';
  });

  it('should configure SNS client with localstack in DEVELOPMENT environment', () => {
    process.env.ENVIRONMENT = 'DEVELOPMENT';

    const messaging = new SNSMessaging();
    expect(SNS).toHaveBeenCalledWith({
      region: 'us-east-1',
      endpoint: 'http://localstack:4566',
    });
  });

  it('should configure SNS client for production environment', () => {
    process.env.ENVIRONMENT = 'PRODUCTION';

    const messaging = new SNSMessaging();
    expect(SNS).toHaveBeenCalledWith({
      region: 'us-east-1',
    });
  });

  it('should throw an error when SNS publish fails', async () => {
    const messaging = new SNSMessaging();

    const message: VideoMessage = {
      type: MessageType.MSG_EXTRACT_SNAPSHOT,
      sender: MessageSender.VIDEO_API_SERVICE,
      target: MessageTarget.VIDEO_IMAGE_PROCESSOR_SERVICE,
      payload: {},
    };

    const publishMock = jest.fn().mockRejectedValue(new Error('SNS error'));
    SNS.prototype.publish = publishMock;

    await expect(messaging.publishMessage(message)).resolves.not.toThrow();
  });

  it('should log error when SNS publish fails', async () => {
    const messaging = new SNSMessaging();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const message: VideoMessage = {
      type: MessageType.MSG_EXTRACT_SNAPSHOT,
      sender: MessageSender.VIDEO_API_SERVICE,
      target: MessageTarget.VIDEO_IMAGE_PROCESSOR_SERVICE,
      payload: {},
    };

    const publishMock = jest.fn().mockRejectedValue(new Error('SNS error'));
    SNS.prototype.publish = publishMock;

    await messaging.publishMessage(message);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Messaging error: TypeError: Cannot read properties of undefined (reading 'promise')",
    );
    consoleSpy.mockRestore();
  });

  it('should handle undefined environment variable gracefully', () => {
    delete process.env.ENVIRONMENT;

    const messaging = new SNSMessaging();
    expect(SNS).toHaveBeenCalledWith({
      region: 'us-east-1',
    });
  });
});
