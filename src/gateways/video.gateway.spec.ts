import { VideoImageExtractionStatus } from '../enum/video-image-extraction-status';
import { Video } from '../entities/video.entity';
import { IDatabase } from '../interfaces/database.interface';
import { VideoGateway } from './video.gateway';

jest.mock('../interfaces/database.interface');

describe('VideoGateway', () => {
  let videoGateway: VideoGateway;
  let databaseMock: jest.Mocked<IDatabase>;

  beforeEach(() => {
    databaseMock = {
      findAllVideos: jest.fn(),
      findVideoById: jest.fn(),
      createVideo: jest.fn(),
      updateVideoStatus: jest.fn(),
      updateVideoStatusAndSnapshotsUrl: jest.fn(),
      deleteVideo: jest.fn(),
    };
    videoGateway = new VideoGateway(databaseMock);
  });

  it('should call findAllVideos and return all videos', async () => {
    const mockVideos: Video[] = [
      new Video(
        'videoId-1',
        new Date(),
        new Date(),
        'userId-1',
        'video name',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      ),
      new Video(
        'videoId-2',
        new Date(),
        new Date(),
        'userId-1',
        'video name',
        'video description',
        'video url',
        'video snapshots url',
        VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
      ),
    ];

    databaseMock.findAllVideos.mockResolvedValue(mockVideos);

    const result = await videoGateway.findAll();

    expect(result).toEqual(mockVideos);
    expect(databaseMock.findAllVideos).toHaveBeenCalledTimes(1);
  });

  it('should call findVideoById and return the video for a valid id', async () => {
    const mockVideo = new Video(
      'videoId-1',
      new Date(),
      new Date(),
      'userId-1',
      'video name',
      'video description',
      'video url',
      'video snapshots url',
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
    );

    databaseMock.findVideoById.mockResolvedValue(mockVideo);

    const result = await videoGateway.findById('videoId-1');

    expect(result).toEqual(mockVideo);
    expect(databaseMock.findVideoById).toHaveBeenCalledWith('videoId-1');
    expect(databaseMock.findVideoById).toHaveBeenCalledTimes(1);
  });

  it('should return null if video is not found by id', async () => {
    databaseMock.findVideoById.mockResolvedValue(null);

    const result = await videoGateway.findById('');

    expect(result).toBeNull();
    expect(databaseMock.findVideoById).toHaveBeenCalledWith('');
    expect(databaseMock.findVideoById).toHaveBeenCalledTimes(1);
  });

  it('should call createVideo and return the created video', async () => {
    const mockVideo = new Video(
      'videoId-1',
      new Date(),
      new Date(),
      'userId-1',
      'video name',
      'video description',
      'video url',
      'video snapshots url',
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PENDING,
    );

    databaseMock.createVideo.mockResolvedValue(mockVideo);

    const result = await videoGateway.create(mockVideo);

    expect(result).toEqual(mockVideo);
    expect(databaseMock.createVideo).toHaveBeenCalledWith(mockVideo);
    expect(databaseMock.createVideo).toHaveBeenCalledTimes(1);
  });

  it('should call updateStatus and return the updated video', async () => {
    const updatedVideo = new Video(
      'videoId-1',
      new Date(),
      new Date(),
      'userId-1',
      'video name',
      'video description',
      'video url',
      'video snapshots url',
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
    );

    databaseMock.updateVideoStatus.mockResolvedValue(updatedVideo);

    const result = await videoGateway.updateStatus(updatedVideo);

    expect(result).toEqual(updatedVideo);
    expect(databaseMock.updateVideoStatus).toHaveBeenCalledWith(updatedVideo);
    expect(databaseMock.updateVideoStatus).toHaveBeenCalledTimes(1);
  });

  it('should call updateStatusAndSnapshotsUrl and return the updated video', async () => {
    const updatedVideo = new Video(
      'videoId-1',
      new Date(),
      new Date(),
      'userId-1',
      'video name',
      'video description',
      'video url',
      'updated video snapshots url',
      VideoImageExtractionStatus.VIDEO_IMAGE_EXTRACTION_PROCESSING,
    );

    databaseMock.updateVideoStatusAndSnapshotsUrl.mockResolvedValue(
      updatedVideo,
    );

    const result = await videoGateway.updateStatusAndSnapshotsUrl(updatedVideo);

    expect(result).toEqual(updatedVideo);
    expect(databaseMock.updateVideoStatusAndSnapshotsUrl).toHaveBeenCalledWith(
      updatedVideo,
    );
    expect(databaseMock.updateVideoStatusAndSnapshotsUrl).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call delete', async () => {
    databaseMock.deleteVideo.mockResolvedValue();

    await videoGateway.delete('videoId-1');

    expect(databaseMock.deleteVideo).toHaveBeenCalledWith('videoId-1');
  });
});
