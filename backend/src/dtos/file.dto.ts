
import { Expose } from 'class-transformer';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export interface IFileDto {
  key: string;
  originalname: string;
  size: number;
}

export class FileDto implements IFileDto {
  @Expose()
  @IsString()
  key: string;

  @Expose()
  @IsString()
  originalname: string;

  @Expose()
  @IsNumber()
  @IsPositive()
  size: number;

  constructor(key: string, originalname: string, size: number) {
    this.key = key;
    this.originalname = originalname;
    this.size = size;
  }
}

export class FileUploadResponseDto extends FileDto {
  @Expose()
  @IsString()
  bucket: string;

  @Expose()
  @IsString()
  message: string;

  constructor(
    key: string,
    originalname: string,
    size: number,
    bucket: string,
    message: string = 'File uploaded successfully'
  ) {
    super(key, originalname, size);
    this.bucket = bucket;
    this.message = message;
  }
}
