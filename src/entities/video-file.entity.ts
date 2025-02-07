import { InvalidVideoFileError } from '../errors/invalid-video-file.error';

export class VideoFile {
  private fileName: string;
  private fileBuffer: Buffer;
  private fileMimetype: string;

  constructor(fileName: string, fileBuffer: Buffer, fileMimetype: string) {
    this.setFileName(fileName);
    this.setFileBuffer(fileBuffer);
    this.setFileMimetype(fileMimetype);
  }

  static new(
    fileName: string,
    fileBuffer: Buffer,
    fileMimetype: string,
  ): VideoFile {
    return new VideoFile(fileName, fileBuffer, fileMimetype);
  }

  public getFileName(): string {
    return this.fileName;
  }

  public getFileBuffer(): Buffer {
    return this.fileBuffer;
  }

  public getFileMimetype(): string {
    return this.fileMimetype;
  }

  public setFileName(fileName: string): void {
    if (!fileName) {
      throw new InvalidVideoFileError('File name must not be null');
    }

    this.fileName = fileName;
  }

  public setFileBuffer(fileBuffer: Buffer): void {
    if (!fileBuffer) {
      throw new InvalidVideoFileError('File buffer must not be null');
    }

    if (fileBuffer.length === 0) {
      throw new InvalidVideoFileError('File buffer must not be empty');
    }

    this.fileBuffer = fileBuffer;
  }

  public setFileMimetype(fileMimetype: string): void {
    console.log(fileMimetype);
    if (!fileMimetype) {
      throw new InvalidVideoFileError('File mimetype must not be null');
    }

    if (fileMimetype !== 'video/mp4') {
      throw new InvalidVideoFileError('File mimetype must be video/mp4');
    }

    this.fileMimetype = fileMimetype;
  }
}
