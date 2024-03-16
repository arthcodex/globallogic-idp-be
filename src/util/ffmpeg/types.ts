export type ProcessVideoParams = {
  id: string;
  video: Express.Multer.File;
  duration: number;
};

export type VideoData = {
  duration: number;
  filename: string;
};
