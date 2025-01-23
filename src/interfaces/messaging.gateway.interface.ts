export interface IMessagingGateway {
  publishVideoImageExtractionRequestMessage(
    videoId: string,
    videoUrl: string,
  ): Promise<void>;

  publishVideoImageExtractionSuccessMessage(
    userId: string,
    videoUrl: string,
    videoDescription: string,
    videoSnapshotsUrl: string,
  ): Promise<void>;

  publishVideoImageExtractionErrorMessage(
    userId: string,
    videoUrl: string,
    videoDescription: string,
    errorMessage: string,
    errorDescription: string,
  ): Promise<void>;
}
