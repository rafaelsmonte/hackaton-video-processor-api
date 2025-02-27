import { Request, Response } from 'express';
import promMid from 'express-prometheus-middleware';
import multer from 'multer';
import { VideoController } from '../controllers/video.controller';
import { IDatabase } from '../interfaces/database.interface';
import { IMessaging } from '../interfaces/messaging.interface';
import { InvalidVideoImageExtractionStatusError } from '../errors/invalid-video-image-extraction-status.error';
import { DatabaseError } from '../errors/database.error';
import { IExternalStorage } from '../interfaces/external-storage.interface';
import { SQS } from 'aws-sdk';
import { VideoMessage } from '../types/video-message.type';
import { MessageSender } from '../enum/message-sender.enum';
import { MessageTarget } from '../enum/message-target.enum';
import { MessageType } from '../enum/message-type.enum';
import { validateUserId } from './validateUserId.middleware';
import { InvalidVideoFileError } from '../errors/invalid-video-file.error';
import { VideoNotFoundError } from '../errors/video-not-found.error';

export class VideoApp {
  constructor(
    private database: IDatabase,
    private messaging: IMessaging,
    private externalStorage: IExternalStorage,
  ) {}

  start() {
    this.startMessagesListener();
    this.startApi();
  }

  startMessagesListener() {
    let sqs: SQS;

    if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
      sqs = new SQS({
        region: process.env.AWS_REGION,
        endpoint: 'http://localhost:4566',
      });
    } else {
      sqs = new SQS({
        region: process.env.AWS_REGION,
      });
    }

    const params = {
      QueueUrl: process.env.VIDEO_API_SQS_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 10,
    };

    const pollMessages = async () => {
      try {
        const receivedMessages = await sqs.receiveMessage(params).promise();

        if (receivedMessages.Messages) {
          for (const rawMessage of receivedMessages.Messages) {
            try {
              console.log(`Message body received: ${rawMessage.Body}`);

              const message = JSON.parse(rawMessage.Body) as VideoMessage;

              if (
                message.sender == MessageSender.VIDEO_IMAGE_PROCESSOR_SERVICE ||
                message.target == MessageTarget.VIDEO_API_SERVICE
              ) {
                if (message.type == MessageType.MSG_EXTRACT_SNAPSHOT_SUCCESS) {
                  await VideoController.handleSuccessMessageReceived(
                    this.database,
                    this.messaging,
                    message.payload['videoId'],
                    message.payload['userId'],
                    message.payload['videoSnapshotsUrl'],
                  );
                } else if (
                  message.type == MessageType.MSG_EXTRACT_SNAPSHOT_ERROR
                ) {
                  await VideoController.handleErrorMessageReceived(
                    this.database,
                    this.messaging,
                    message.payload['videoId'],
                    message.payload['userId'],
                    message.payload['errorMessage'],
                    message.payload['errorDescription'],
                  );
                } else if (
                  message.type == MessageType.MSG_EXTRACT_SNAPSHOT_PROCESSING
                ) {
                  await VideoController.handleProcessingMessageReceived(
                    this.database,
                    message.payload['videoId'],
                    message.payload['userId'],
                  );
                } else {
                  console.error(`Unknown message type ${message.type}`);
                }
              } else {
                console.error(
                  `Unknown message target ${message.target} or message sender ${message.sender}`,
                );
              }

              await sqs
                .deleteMessage({
                  QueueUrl: process.env.VIDEO_API_SQS_QUEUE_URL,
                  ReceiptHandle: rawMessage.ReceiptHandle,
                })
                .promise();
            } catch (error) {
              console.error('Error processing message: ', error);
            }
          }
        }
      } catch (error) {
        console.log('An unexpected error has occurred: ' + error);
      }

      setImmediate(pollMessages);
    };

    pollMessages();
  }

  startApi() {
    const express = require('express');
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
      },
    });
    const bodyParser = require('body-parser');
    const swaggerUi = require('swagger-ui-express');

    const port = 3000;
    const app = express();

    app.use(bodyParser.json());

    // Metrics
    app.use(
      promMid({
        metricsPath: '/metrics',
        collectDefaultMetrics: true,
        requestDurationBuckets: [0.1, 0.5, 1, 1.5],
        requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
      }),
    );

    // Swagger
    const options = require('./swagger.json');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(options));

    // Video endpoints
    app.get(
      '/videos',
      validateUserId,
      async (request: Request, response: Response) => {
        const userId = (request as any).userId;

        await VideoController.findAll(this.database, userId)
          .then((videos) => {
            response
              .setHeader('Content-type', 'application/json')
              .status(200)
              .send(videos);
          })
          .catch((error) => this.handleError(error, response));
      },
    );

    app.get(
      '/videos/:id',
      validateUserId,
      async (request: Request, response: Response) => {
        const id = String(request.params.id);
        const userId = (request as any).userId;

        await VideoController.findById(this.database, id, userId)
          .then((video) => {
            response
              .setHeader('Content-type', 'application/json')
              .status(200)
              .send(video);
          })
          .catch((error) => this.handleError(error, response));
      },
    );

    app.post(
      '/videos',
      validateUserId,
      upload.single('video'),
      async (request: Request, response: Response) => {
        const { description } = request.body;
        const userId = (request as any).userId;

        await VideoController.create(
          this.database,
          this.messaging,
          this.externalStorage,
          request.file?.originalname,
          request.file?.buffer,
          request.file?.mimetype,
          userId,
          description,
        )
          .then((video) => {
            response
              .setHeader('Content-type', 'application/json')
              .status(200)
              .send(video);
          })
          .catch((error) => this.handleError(error, response));
      },
    );

    app.post(
      '/videos/:id/retry',
      validateUserId,
      async (request: Request, response: Response) => {
        const id = String(request.params.id);
        const userId = (request as any).userId;

        await VideoController.retry(this.database, this.messaging, id, userId)
          .then((video) => {
            response
              .setHeader('Content-type', 'application/json')
              .status(200)
              .send(video);
          })
          .catch((error) => this.handleError(error, response));
      },
    );

    app.listen(port, () => {
      console.log(`Tech challenge app listening on port ${port}`);
    });
  }

  handleError(error: Error, response: Response): void {
    if (error instanceof InvalidVideoImageExtractionStatusError) {
      response.status(400).json({ message: error.message });
    } else if (error instanceof InvalidVideoFileError) {
      response.status(400).json({ message: error.message });
    } else if (error instanceof VideoNotFoundError) {
      response.status(404).json({ message: error.message });
    } else if (error instanceof DatabaseError) {
      response.status(500).json({ message: error.message });
    } else {
      console.log('An unexpected error has occurred: ' + error);
      response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
