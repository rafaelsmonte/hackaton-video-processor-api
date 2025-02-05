// import { IMessaging } from '../interfaces/messaging.interface';
// import { MessageType } from '../enum/message-type.enum';
// import { MessageSender } from '../enum/message-sender.enum';
// import { MessageTarget } from '../enum/message-target.enum';
// import { MessagingGateway } from './messaging.gateway';
// import { VideoMessage } from 'src/types/video-message.type';

// jest.mock('../interfaces/messaging.interface');

// describe('MessagingGateway', () => {
//   let messagingGateway: MessagingGateway;
//   let messagingMock: jest.Mocked<IMessaging>;

//   beforeEach(() => {
//     messagingMock = {
//       publishMessage: jest.fn(),
//     };
//     messagingGateway = new MessagingGateway(messagingMock);
//   });

//   it('should call publishVideoImageExtractionRequestMessage to request video image extraction', async () => {
//     const videoId = 'videoId-1';
//     const videoUrl = 'video url';

//     const expectedMessage: VideoMessage = {
//       type: MessageType.MSG_EXTRACT_SNAPSHOT,
//       sender: MessageSender.VIDEO_API_SERVICE,
//       target: MessageTarget.VIDEO_IMAGE_PROCESSOR_SERVICE,
//       payload: {
//         videoId,
//         videoUrl,
//       },
//     };

//     await messagingGateway.publishVideoImageExtractionRequestMessage(
//       videoId,
//       videoUrl,
//     );

//     expect(messagingMock.publishMessage).toHaveBeenCalledWith(expectedMessage);
//     expect(messagingMock.publishMessage).toHaveBeenCalledTimes(1);
//   });

//   it('should call publishVideoImageExtractionSuccessMessage when video image extraction was successfully done', async () => {
//     const userId = 'userId-1';
//     const videoUrl = 'video url';
//     const videoDescription = 'video description';
//     const videoSnapshotsUrl = 'video snapshots url';

//     const expectedMessage: VideoMessage = {
//       type: MessageType.MSG_SEND_SNAPSHOT_EXTRACTION_SUCCESS,
//       sender: MessageSender.VIDEO_API_SERVICE,
//       target: MessageTarget.EMAIL_SERVICE,
//       payload: {
//         userId,
//         videoUrl,
//         videoDescription,
//         videoSnapshotsUrl,
//       },
//     };

//     await messagingGateway.publishVideoImageExtractionSuccessMessage(
//       userId,
//       videoUrl,
//       videoDescription,
//       videoSnapshotsUrl,
//     );

//     expect(messagingMock.publishMessage).toHaveBeenCalledWith(expectedMessage);
//     expect(messagingMock.publishMessage).toHaveBeenCalledTimes(1);
//   });

//   it('should call publishVideoImageExtractionErrorMessage when video image extraction has failed', async () => {
//     const userId = 'userId-1';
//     const videoUrl = 'video url';
//     const videoDescription = 'video description';
//     const errorMessage = 'error message';
//     const errorDescription = 'error description';

//     const expectedMessage: VideoMessage = {
//       type: MessageType.MSG_SEND_SNAPSHOT_EXTRACTION_ERROR,
//       sender: MessageSender.VIDEO_API_SERVICE,
//       target: MessageTarget.EMAIL_SERVICE,
//       payload: {
//         userId,
//         videoUrl,
//         videoDescription,
//         errorMessage,
//         errorDescription,
//       },
//     };

//     await messagingGateway.publishVideoImageExtractionErrorMessage(
//       userId,
//       videoUrl,
//       videoDescription,
//       errorMessage,
//       errorDescription,
//     );

//     expect(messagingMock.publishMessage).toHaveBeenCalledWith(expectedMessage);
//     expect(messagingMock.publishMessage).toHaveBeenCalledTimes(1);
//   });
// });
