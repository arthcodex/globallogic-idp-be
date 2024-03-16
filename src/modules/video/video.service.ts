import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { PAGINATION_LIMIT } from './constants';
import { PaginatedResponse } from '../../types/pagination';

@Injectable()
export class VideoService {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async create(videoDto: CreateVideoDto): Promise<VideoDocument> {
    const createdCat = new this.videoModel(videoDto);
    return createdCat.save();
  }

  async setAlive(id: string, isAlive: boolean): Promise<Video> {
    return this.videoModel.findByIdAndUpdate(id, { alive: isAlive }).exec();
  }

  async findOne(id: string): Promise<Video> {
    return this.videoModel.findById(id).exec();
  }

  async findAll(page: number = 0): Promise<PaginatedResponse<Video>> {
    const count = await this.videoModel.countDocuments({}).exec();
    const totalPages = Math.floor((count - 1) / PAGINATION_LIMIT) + 1;
    const data = await this.videoModel
      .find({ alive: true })
      .limit(PAGINATION_LIMIT)
      .skip(page)
      .exec();
    return { data, totalPages, page };
  }
}
