import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { VideoService } from './video.service';
import { Video } from './schemas/video.schema';
import { PAGINATION_LIMIT } from './constants';

const mockVideo = {
  name: 'video.mp4',
  duration: 100,
  alive: false,
  _id: 'sample id',
};

const mockVideosList = [
  {
    name: 'Video #1',
    duration: 100,
    alive: true,
    _id: 'sample_id_1',
  },
  {
    name: 'Video #2',
    duration: 100,
    alive: true,
    _id: 'sample_id_2',
  },
  {
    name: 'Video #3',
    duration: 100,
    alive: true,
    _id: 'sample_id_3',
  },
];

class MockVideoModel {
  constructor() {}

  save = jest.fn().mockResolvedValue(mockVideo);

  static find = jest.fn();
  static create = jest.fn();
  static countDocuments = jest.fn();
}

describe('VideoService', () => {
  let service: VideoService;
  let model: Model<Video>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: getModelToken(Video.name),
          useValue: MockVideoModel,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    model = module.get<Model<Video>>(getModelToken(Video.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    [1, 100],
    [3, 50],
    [5, 20],
  ])('should return all videos with pagination', async (page, count) => {
    jest.spyOn(model, 'countDocuments').mockReturnValue({
      exec: jest.fn().mockResolvedValue(count),
    } as any);
    jest.spyOn(model, 'find').mockReturnValue({
      limit: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockVideosList),
        }),
      }),
    } as any);

    const videos = await service.findAll(page);
    expect(videos).toEqual({
      data: mockVideosList,
      totalPages: Math.floor((count - 1) / PAGINATION_LIMIT) + 1,
      page,
    });
  });

  it('should insert a new cat', async () => {
    jest
      .spyOn(model, 'create')
      .mockImplementationOnce(() => Promise.resolve(mockVideo as any));

    const newVideo = await service.create(mockVideo);
    expect(newVideo).toEqual(mockVideo);
  });
});
