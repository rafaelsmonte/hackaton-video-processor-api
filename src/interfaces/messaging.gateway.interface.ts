export interface IMessagingGateway {
  publishVideoImageExtractionRequestMessage(
    videoId: string,
    videoUrl: string,
  ): Promise<void>;

  publishVideoImageExtractionSuccessMessage(
    userId: number,
    videoUrl: string,
    videoSnapshotsUrl: string,
  ): Promise<void>;

  publishVideoImageExtractionErrorMessage(
    userId: number,
    videoUrl: string,
    errorMessage: string,
    errorDescription: string,
  ): Promise<void>;
}
