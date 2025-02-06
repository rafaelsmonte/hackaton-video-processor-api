import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';

export class Video {
  private id: string;
  private createdAt: Date;
  private updatedAt: Date;
  private userId: string;
  private name: string;
  private description: string;
  private url: string;
  private snapshotsUrl: string;
  private status: VideoImageExtractionStatus;

  constructor(
    id: string,
    createdAt: Date,
    updateAt: Date,
    userId: string,
    name: string,
    description: string,
    url: string,
    snapshotsUrl: string,
    status: VideoImageExtractionStatus,
  ) {
    this.setId(id);
    this.setCreatedAt(createdAt);
    this.setUpdatedAt(updateAt);
    this.setUserId(userId);
    this.setName(name);
    this.setDescription(description);
    this.setUrl(url);
    this.setSnapshotsUrl(snapshotsUrl);
    this.setStatus(status);
  }

  static new(
    userId: string,
    name: string,
    description: string,
    url: string,
    status: VideoImageExtractionStatus,
  ): Video {
    const now = new Date();
    return new Video('', now, now, userId, name, description, url, '', status);
  }

  // getters
  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getStatus(): string {
    return this.status;
  }

  public getDescription(): string {
    return this.description;
  }

  public getUrl(): string {
    return this.url;
  }

  public getSnapshotsUrl(): string {
    return this.snapshotsUrl;
  }

  // setters
  public setId(id: string): void {
    this.id = id;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setStatus(status: string): void {
    this.status = VideoImageExtractionStatus[status];
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public setUrl(url: string): void {
    this.url = url;
  }

  public setSnapshotsUrl(snapshotsUrl: string): void {
    this.snapshotsUrl = snapshotsUrl;
  }
}
