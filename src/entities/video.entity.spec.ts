import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { Video } from './video.entity';

describe('Video', () => {
  describe('constructor', () => {
    it('should create a valid video object', () => {
      const video = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );

      expect(video.getId()).toBe('videoId-1');
      expect(video.getUserId()).toBe('userId-1');
      expect(video.getDescription()).toBe('video description');
      expect(video.getUrl()).toBe('video url');
      expect(video.getSnapshotsUrl()).toBe('video snapshots url');
      expect(video.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );
    });
  });

  describe('new', () => {
    it('should create a new video with default values except userId, description, url and status', () => {
      const userId = 'userId-1';
      const description = 'video description';
      const url = 'video url';
      const status = VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING;

      const video = Video.new(userId, description, url, status);

      expect(video.getId()).toBe('');
      expect(video.getUserId()).toBe('userId-1');
      expect(video.getDescription()).toBe('video description');
      expect(video.getUrl()).toBe('video url');
      expect(video.getSnapshotsUrl()).toBe('');
      expect(video.getStatus()).toBe(
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );
    });
  });

  describe('setters and getters', () => {
    it('should set and get the video fields correctly', () => {
      const video = new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      );

      video.setId('videoId-1');
      expect(video.getId()).toBe('videoId-1');

      video.setUserId('userId-1');
      expect(video.getUserId()).toBe('userId-1');

      video.setDescription('video description');
      expect(video.getDescription()).toBe('video description');

      video.setUrl('video url');
      expect(video.getUrl()).toBe('video url');

      video.setSnapshotsUrl('video snapshots url');
      expect(video.getSnapshotsUrl()).toBe('video snapshots url');

      video.setStatus('VIDEO_IMAGE_EXTRACTION_PENDING');
      expect(video.getStatus()).toBe('VIDEO_IMAGE_EXTRACTION_PENDING');
    });
  });
});
