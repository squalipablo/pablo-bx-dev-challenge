import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import getCommonConfig from './configs/common';
import getUploadConfig from './configs/upload.config';
import { FilesModule } from './modules/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getCommonConfig, getUploadConfig] }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api*'],
    }),
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
