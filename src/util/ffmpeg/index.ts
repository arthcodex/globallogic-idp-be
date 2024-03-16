import { Readable } from 'stream';
import { ProcessVideoParams, VideoData } from './types';

import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const OPERATION_TIMEOUT_IN_SECONDS: number = 30000;
export const segmentVideo = async ({
  id,
  video,
}: ProcessVideoParams): Promise<boolean> => {
  return new Promise((resolve) => {
    fs.mkdirSync(`public/storage/${id}`);
    const stream: Readable = Readable.from(video.buffer);
    ffmpeg(stream, { timeout: OPERATION_TIMEOUT_IN_SECONDS })
      .outputOptions([
        '-hls_time 30',
        '-hls_playlist_type vod',
        `-hls_segment_filename public/storage/${id}/${id}-%03d.ts`,
        `-hls_base_url /public/storage/${id}/`,
      ])
      .on('error', () => {
        resolve(false);
      })
      .on('end', () => {
        resolve(true);
      })
      .output(`public/storage/${id}/${id}.m3u8`)
      .run();
  });
};

export const getVideoData = async (
  video: Express.Multer.File,
): Promise<VideoData> => {
  return new Promise((resolve) => {
    const stream: Readable = Readable.from(video.buffer);
    const command = ffmpeg(stream);
    command.ffprobe((_, metadata): void => {
      resolve({
        duration: Math.floor(metadata?.format?.duration ?? 0),
        filename: metadata?.format?.filename,
      });
    });
  });
};

export const generateVideoPreview = async ({
  id,
  video,
  duration,
}: ProcessVideoParams): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const stream: Readable = Readable.from(video.buffer);
    ffmpeg(stream, { timeout: OPERATION_TIMEOUT_IN_SECONDS })
      .outputOptions([`-vf fps=1/${duration}`])
      .on('error', () => {
        resolve(false);
      })
      .on('end', () => {
        resolve(true);
      })
      .output(`public/storage/${id}/${id}.png`)
      .run();
  });
};
