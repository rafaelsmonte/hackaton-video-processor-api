import { Video } from '../entities/video.entity';

export interface IDatabase {
  findAllVideos(): Promise<Video[]>;
  findVideoById(id: string): Promise<Video | null>;
  createVideo(video: Video): Promise<Video>;
  updateVideoStatus(video: Video): Promise<Video>;
  updateVideoStatusAndSnapshotsUrl(video: Video): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
}
