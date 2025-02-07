import { InvalidVideoFileError } from '../errors/invalid-video-file.error';
import { VideoFile } from './video-file.entity';

describe('VideoFile', () => {
  const validFileName = 'test.mp4';
  const validFileBuffer = Buffer.from('video data');
  const validFileMimetype = 'video/mp4';

  it('should create a VideoFile instance with valid parameters', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );

    expect(videoFile.getFileName()).toBe(validFileName);
    expect(videoFile.getFileBuffer()).toBe(validFileBuffer);
    expect(videoFile.getFileMimetype()).toBe(validFileMimetype);
  });

  it('should throw an error if fileName is null', () => {
    expect(
      () => new VideoFile(null, validFileBuffer, validFileMimetype),
    ).toThrow(InvalidVideoFileError);
  });

  it('should throw an error if fileBuffer is null', () => {
    expect(() => new VideoFile(validFileName, null, validFileMimetype)).toThrow(
      InvalidVideoFileError,
    );
  });

  it('should throw an error if fileBuffer is empty', () => {
    expect(
      () => new VideoFile(validFileName, Buffer.alloc(0), validFileMimetype),
    ).toThrow(InvalidVideoFileError);
  });

  it('should throw an error if fileMimetype is null', () => {
    expect(() => new VideoFile(validFileName, validFileBuffer, null)).toThrow(
      InvalidVideoFileError,
    );
  });

  it('should throw an error if fileMimetype is not video/mp4', () => {
    expect(
      () => new VideoFile(validFileName, validFileBuffer, 'image/png'),
    ).toThrow(InvalidVideoFileError);
  });

  it('should allow setting a valid file name', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    videoFile.setFileName('newName.mp4');
    expect(videoFile.getFileName()).toBe('newName.mp4');
  });

  it('should throw an error when setting an invalid file name', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(() => videoFile.setFileName(null)).toThrow(InvalidVideoFileError);
  });

  it('should allow setting a valid file buffer', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    const newBuffer = Buffer.from('new video data');
    videoFile.setFileBuffer(newBuffer);
    expect(videoFile.getFileBuffer()).toBe(newBuffer);
  });

  it('should throw an error when setting an invalid file buffer', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(() => videoFile.setFileBuffer(null)).toThrow(InvalidVideoFileError);
  });

  it('should throw an error when setting an empty file buffer', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(() => videoFile.setFileBuffer(Buffer.alloc(0))).toThrow(
      InvalidVideoFileError,
    );
  });

  it('should allow setting a valid file mimetype', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    videoFile.setFileMimetype('video/mp4');
    expect(videoFile.getFileMimetype()).toBe('video/mp4');
  });

  it('should throw an error when setting an invalid file mimetype', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(() => videoFile.setFileMimetype('image/jpeg')).toThrow(
      InvalidVideoFileError,
    );
  });

  it('should throw an error when setting a null file mimetype', () => {
    const videoFile = new VideoFile(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(() => videoFile.setFileMimetype(null)).toThrow(
      InvalidVideoFileError,
    );
  });

  it('should create a new instance using the static new method', () => {
    const videoFile = VideoFile.new(
      validFileName,
      validFileBuffer,
      validFileMimetype,
    );
    expect(videoFile).toBeInstanceOf(VideoFile);
    expect(videoFile.getFileName()).toBe(validFileName);
  });
});
