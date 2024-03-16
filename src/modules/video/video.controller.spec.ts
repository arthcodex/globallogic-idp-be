import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoDocument } from './schemas/video.schema';
import * as ffmpeg from '../../util/ffmpeg';

describe('Video Controller', () => {
  let controller: VideoController;
  let service: VideoService;

  const mockVideo = {
    name: 'video.mp4',
    duration: 100,
    alive: false,
    _id: 'sample_id',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: {
            findAll: jest.fn((page: number) => ({
              data: mockVideosList,
              totalPages: 10,
              page,
            })),
            create: jest.fn().mockResolvedValue({ id: mockVideo._id }),
            setAlive: jest.fn().mockResolvedValue(mockVideo),
          },
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    service = module.get<VideoService>(VideoService);
  });

  describe('create()', () => {
    it('should create a new video', async () => {
      jest.spyOn(ffmpeg, 'getVideoData').mockResolvedValue({
        duration: 100,
        filename: 'video.mp4',
      });
      jest.spyOn(ffmpeg, 'generateVideoPreview').mockResolvedValue(true);
      jest.spyOn(ffmpeg, 'segmentVideo').mockResolvedValue(true);

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValueOnce(mockVideo as unknown as VideoDocument);

      const result = await controller.create({} as Express.Multer.File);
      expect(createSpy).toHaveBeenCalledWith(mockVideo);
      expect(result).toEqual({ _id: mockVideo._id });
    });
  });

  describe('findAll()', () => {
    it.each([1, 3, 5])(
      'should return an array of videos from page %s',
      async (page) => {
        const videos = await controller.findAll({ page });
        expect(videos).toEqual({
          data: mockVideosList,
          totalPages: 10,
          page,
        });
        expect(service.findAll).toHaveBeenCalled();
      },
    );
  });
});
