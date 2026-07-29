export type FileCategory =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "archive"
  | "other";

export interface CloudFile {
  id: string;
  name: string;

  size: string;
  sizeInBytes: number;

  category: FileCategory;
  extension: string;

  uploadedAt: string;
  createdAt: string;

  contentType: string;
  s3Key: string;
  status: string;

  isFavorite: boolean;
}

export interface CloudFolder {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
}