import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  StreamableFile,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { GCSService } from '../services/gcs/gcs.service';
import { ConfigService } from '@nestjs/config';
import { UploadConfig } from '../configs/upload.config';
import { FileDto, FileUploadResponseDto } from '../dtos/file.dto';
import { Mapper } from '../utils/mapper/mapper';

@Controller('files')
export class FilesController {
  constructor(private readonly gcsService: GCSService, private readonly configService: ConfigService) {}

  @Get()
  async getFiles(): Promise<FileDto[]> {
    try {
      const files = await this.gcsService.listFiles();
      return files.map(file => new FileDto(
        file.key,
        file.originalname,
        file.size
      ));
    } catch (error) {
      console.error('Error listing files:', {
        error,
        message: (error as any)?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });

      if ((error as any)?.message?.includes('credentials') || (error as any)?.message?.includes('authentication')) {
        throw new BadRequestException('Credenziali Google Cloud non configurate. Verifica il file JSON delle credenziali.');
      }

      throw new BadRequestException(`Errore caricamento file: ${(error as any)?.message || 'Errore sconosciuto'}`);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    const uploadConfig = this.configService.get<UploadConfig>('uploadConfig');

    if (!uploadConfig) {
      throw new BadRequestException('Upload configuration not found');
    }

    // Validate file size
    if (file.size > uploadConfig.maxFileSize) {
      const maxSizeMB = uploadConfig.maxFileSize / (1024 * 1024);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      );
    }

    // Validate file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !uploadConfig.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `File extension not allowed. Allowed extensions: ${uploadConfig.allowedExtensions.join(', ').toUpperCase()}`,
      );
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate the file
    this.validateFile(file);

    try {
      const uploadResult = await this.gcsService.uploadFile(file);

      const response = new FileUploadResponseDto(
        uploadResult.key,
        file.originalname,
        file.size,
        uploadResult.bucket,
        'File uploaded successfully'
      );

      return Mapper.mapToPlain(response);
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  @Get(':key/download')
  async downloadFile(
    @Param('key') key: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      const fileData = await this.gcsService.downloadFile(key);

      res.set({
        'Content-Type': fileData.contentType,
        'Content-Disposition': fileData.contentDisposition,
        ...(fileData.contentLength && { 'Content-Length': fileData.contentLength.toString() }),
      });

      return new StreamableFile(fileData.stream as any);
    } catch (error: any) {
      console.error('Download error:', error);
      if (error?.name === 'NoSuchKey') {
        throw new NotFoundException('File not found');
      }
      throw new BadRequestException('Failed to download file');
    }
  }

  @Get('config')
  async getUploadConfig() {
    const uploadConfig = this.configService.get<UploadConfig>('uploadConfig');
    if (!uploadConfig) {
      throw new BadRequestException('Upload configuration not found');
    }

    return {
      maxFileSize: uploadConfig.maxFileSize,
      allowedExtensions: uploadConfig.allowedExtensions.map(ext => ext.toUpperCase()),
    };
  }
}