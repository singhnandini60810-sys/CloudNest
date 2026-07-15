export type FileCategory =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "other";

export interface CloudFile {
  id: string;
  name: string;
  size: string;
  category: FileCategory;
  extension: string;
  uploadedAt: string;
  isFavorite: boolean;
}

export interface CloudFolder {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
}