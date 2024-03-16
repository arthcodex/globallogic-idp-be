import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './schemas/video.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoValidationPipe } from './pipes/video-validation.pipe';
import {
  generateVideoPreview,
  getVideoDuration,
  segmentVideo,
} from '../../util/ffmpeg';
import { PaginatedResponse } from '../../types/pagination';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  @HttpCode(201)
  async create(@UploadedFile(VideoValidationPipe) video: Express.Multer.File) {
    const date: Date = new Date();
    const duration: number = await getVideoDuration(video);

    /* Create video instance in DB */
    const created = await this.videoService.create({
      name: `Video from ${date.toISOString()}`,
      duration,
      alive: false,
    });

    /* Populate storage with media */
    const results = await Promise.all([
      segmentVideo({
        id: created.id,
        duration,
        video,
      }),
      generateVideoPreview({
        id: created.id,
        duration,
        video,
      }),
    ]);

    if (results.some((result) => result !== true)) {
      throw new InternalServerErrorException('Video uploading failed');
    }

    await this.videoService.setAlive(created.id, true);

    return { _id: created.id };
  }

  @Get()
  async findAll(
    @Query() query: { page?: number },
  ): Promise<PaginatedResponse<Video>> {
    let response: PaginatedResponse<Video>;

    try {
      response = await this.videoService.findAll(query.page);
    } catch (error) {
      throw new InternalServerErrorException('Videos fetch failed');
    }

    return response;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Video> {
    let video: Video;

    try {
      video = await this.videoService.findOne(id);
    } catch (error) {
      throw new NotFoundException('Video you requested has not been found');
    }

    return video;
  }
}
