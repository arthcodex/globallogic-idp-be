import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Video, VideoSchema } from './schemas/video.schema';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
