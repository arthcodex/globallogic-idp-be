import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoModule } from './modules/video/video.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017'), VideoModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
