import { VideoApp } from './app';
import { DynamoDatabase } from './external/dynamo-database.external';
import { S3Storage } from './external/s3-storage.external';
import { SNSMessaging } from './external/sns-messaging.external';

const database = new DynamoDatabase();
const messaging = new SNSMessaging();
const externalStorage = new S3Storage();

const app = new VideoApp(database, messaging, externalStorage);

app.start();
