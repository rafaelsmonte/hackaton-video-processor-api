import { Video } from '../entities/video.entity';

export const VideoAdapter = {
  adaptArrayJson: (videos: Video[]): string => {
    const mappedVideos = videos.map((video) => {
      return {
        id: video.getId(),
        createdAt: video.getCreatedAt(),
        updatedAt: video.getUpdatedAt(),
        userId: video.getUserId(),
        description: video.getDescription(),
        url: video.getUrl(),
        snapshotsUrl: video.getSnapshotsUrl(),
        status: video.getStatus(),
      };
    });

    return JSON.stringify(mappedVideos);
  },

  adaptJson: (video: Video | null): string => {
    if (!video) return JSON.stringify({});

    const mappedVideo = {
      id: video.getId(),
      createdAt: video.getCreatedAt(),
      updatedAt: video.getUpdatedAt(),
      userId: video.getUserId(),
      description: video.getDescription(),
      url: video.getUrl(),
      snapshotsUrl: video.getSnapshotsUrl(),
      status: video.getStatus(),
    };

    return JSON.stringify(mappedVideo);
  },
};
