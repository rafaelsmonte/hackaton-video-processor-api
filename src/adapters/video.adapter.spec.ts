import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { Video } from '../entities/video.entity';
import { VideoAdapter } from './video.adapter';

const removeTimestamp = (str: string) =>
  str.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '[DATE]');

describe('VideoAdapter', () => {
  const mockVideo = (): Video => {
    return Video.new(
      'userId-1',
      'video description',
      'video url',
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
    );
  };

  describe('adaptArrayJson', () => {
    it('should return JSON string for an array of videos', () => {
      const videos = [mockVideo()];
      const result = VideoAdapter.adaptArrayJson(videos);

      const expected = JSON.stringify([
        {
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'userId-1',
          description: 'video description',
          url: 'video url',
          snapshotsUrl: '',
          status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
        },
      ]);

      expect(removeTimestamp(result)).toEqual(removeTimestamp(expected));
    });

    it('should return an empty array JSON string when given an empty array', () => {
      const result = VideoAdapter.adaptArrayJson([]);
      expect(result).toBe(JSON.stringify([]));
    });
  });

  describe('adaptJson', () => {
    it('should return JSON string for a single video', () => {
      const video = mockVideo();
      const result = VideoAdapter.adaptJson(video);
      const expected = JSON.stringify({
        id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'userId-1',
        description: 'video description',
        url: 'video url',
        snapshotsUrl: '',
        status: VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      });

      expect(removeTimestamp(result)).toEqual(removeTimestamp(expected));
    });

    it('should return an empty object JSON string when given null', () => {
      const result = VideoAdapter.adaptJson(null);
      expect(result).toBe(JSON.stringify({}));
    });
  });
});
