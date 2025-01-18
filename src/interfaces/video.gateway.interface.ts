import { Video } from '../entities/video.entity';

export interface IVideoGateway {
  findAll(): Promise<Video[]>;
  findById(id: string): Promise<Video | null>;
  create(video: Video): Promise<Video>;
  updateStatus(video: Video): Promise<Video>;
  updateStatusAndSnapshotsUrl(video: Video): Promise<Video>;
  delete(id: string): Promise<void>;
}
