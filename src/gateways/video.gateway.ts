import { IDatabase } from '../interfaces/database.interface';
import { Video } from '../entities/video.entity';
import { IVideoGateway } from '../interfaces/video.gateway.interface';

export class VideoGateway implements IVideoGateway {
  constructor(private database: IDatabase) {}

  async findAll(userId: string): Promise<Video[]> {
    return this.database.findAllVideos(userId);
  }

  async findById(id: string, userId: string): Promise<Video | null> {
    return this.database.findVideoById(id, userId);
  }

  async create(video: Video): Promise<Video> {
    return this.database.createVideo(video);
  }

  async updateStatus(video: Video): Promise<Video> {
    return this.database.updateVideoStatus(video);
  }

  async updateStatusAndSnapshotsUrl(video: Video): Promise<Video> {
    return this.database.updateVideoStatusAndSnapshotsUrl(video);
  }

  async delete(id: string): Promise<void> {
    return this.database.deleteVideo(id);
  }
}
