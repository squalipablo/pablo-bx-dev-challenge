import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GCSService implements OnModuleInit {
  private storage: Storage;
  private bucketName: string;
  private readonly logger = new Logger(GCSService.name);
  private initialized = false;

  constructor(
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.initializeStorage();
  }

  private async initializeStorage() {
    const projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT_ID');
    const keyFilename = this.configService.get<string>('GOOGLE_CLOUD_KEY_FILE');

    if (!projectId || !keyFilename) {
      throw new Error('Missing Google Cloud credentials. Configure GOOGLE_CLOUD_PROJECT_ID and GOOGLE_CLOUD_KEY_FILE in .env file');
    }

    this.storage = new Storage({
      projectId,
      keyFilename,
    });

    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME') || 'pablo-bx-chal';
    this.initialized = true;

    this.logger.log('Google Cloud Storage Service initialized with local credentials');
    this.logger.log(`   Project: ${projectId}`);
    this.logger.log(`   Bucket: ${this.bucketName}`);
    this.logger.log(`   Key file: ${keyFilename}`);
  }

  async uploadFile(file: Express.Multer.File): Promise<{ key: string; bucket: string }> {
    // unique id and remove special characters from original name
    const key = `${uuidv4()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const bucket = this.storage.bucket(this.bucketName);
    const gcsFile = bucket.file(key);

    await gcsFile.save(file.buffer, {
      metadata: {
        metadata: {
          originalName: file.originalname,
        },
      },
    });

    return { key, bucket: this.bucketName };
  }

  async downloadFile(key: string): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
    contentLength?: number;
    contentDisposition?: string;
  }> {
    const bucket = this.storage.bucket(this.bucketName);
    const gcsFile = bucket.file(key);

    const [metadata] = await gcsFile.getMetadata();
    const stream = gcsFile.createReadStream();

    return {
      stream,
      contentType: metadata.contentType || 'application/octet-stream',
      contentLength: metadata.size ? parseInt(metadata.size.toString()) : undefined,
      contentDisposition: metadata.metadata?.originalName
        ? `attachment; filename="${metadata.metadata.originalName}"`
        : `attachment; filename="${key}"`,
    };
  }

  async listFiles(): Promise<{
    key: string;
    originalname: string;
    size: number;
  }[]> {
    const bucket = this.storage.bucket(this.bucketName);
    const [files] = await bucket.getFiles();

    return files.map(file => ({
      key: file.name,
      originalname: typeof file.metadata?.metadata?.originalName === 'string' 
        ? file.metadata.metadata.originalName 
        : file.name,
      size: file.metadata?.size ? parseInt(file.metadata.size.toString()) : 0,
    }));
  }
}