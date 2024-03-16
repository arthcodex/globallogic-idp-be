import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { MAX_VIDEO_SIZE_IN_BYTES } from '../constants';

export const VideoValidationPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({ fileType: 'video/mp4' })
  .addMaxSizeValidator({ maxSize: MAX_VIDEO_SIZE_IN_BYTES })
  .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });
