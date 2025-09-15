import { Module } from '@nestjs/common';
import { FilesController } from '../controllers/files.controller';
import { AuthController } from '../controllers/auth.controller';
import { GCSService } from '../services/gcs/gcs.service';
import { AuthService } from '../services/auth/auth.service';

@Module({
  controllers: [FilesController, AuthController],
  providers: [GCSService, AuthService],
})
export class FilesModule {}