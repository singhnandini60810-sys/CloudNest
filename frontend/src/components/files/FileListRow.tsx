import {
  Download,
  FileArchive,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

import type { CloudFile } from "../../types/file";

interface FileListRowProps {
  file: CloudFile;
  onToggleFavorite: (
    fileId: string,
  ) => void;
  onDownload: (
    file: CloudFile,
  ) => void;
  onShare: (
    file: CloudFile,
  ) => void;
  onDelete: (
    file: CloudFile,
  ) => void;
}

const categoryIcons = {
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileMusic,
  archive: FileArchive,
  other: FileText,
};

function getFileId(
  file: CloudFile,
): string {
  const fileRecord =
    file as unknown as Record<
      string,
      unknown
    >;

  const possibleIds = [
    fileRecord.fileId,
    fileRecord.id,
    fileRecord.file_id,
    fileRecord.key,
    fileRecord.s3Key,
  ];

  for (const value of possibleIds) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return "";
}

function FileListRow({
  file,
  onToggleFavorite,
  onDownload,
  onShare,
  onDelete,
}: FileListRowProps) {
  const Icon =
    categoryIcons[file.category] ??
    FileText;

  const fileId = getFileId(file);

  return (
    <div className="file-list-row">
      <div className="file-list-row__name">
        <span
          className={`file-list-row__icon file-list-row__icon--${file.category}`}
        >
          <Icon size={22} />
        </span>

        <strong title={file.name}>
          {file.name}
        </strong>
      </div>

      <span className="file-list-row__category">
        {file.category}
      </span>

      <span className="file-list-row__size">
        {file.size}
      </span>

      <time className="file-list-row__date">
        {file.uploadedAt}
      </time>

      <div className="file-list-row__actions">
        <button
          type="button"
          className={
            file.isFavorite
              ? "favorite-active"
              : ""
          }
          disabled={!fileId}
          onClick={() => {
            if (fileId) {
              onToggleFavorite(
                fileId,
              );
            }
          }}
          aria-label={
            file.isFavorite
              ? `Remove ${file.name} from favorites`
              : `Add ${file.name} to favorites`
          }
          title={
            file.isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Star
            size={18}
            fill={
              file.isFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <button
          type="button"
          onClick={() =>
            onDownload(file)
          }
          aria-label={`Download ${file.name}`}
          title="Download"
        >
          <Download size={18} />
        </button>

        <button
          type="button"
          onClick={() =>
            onShare(file)
          }
          aria-label={`Share ${file.name}`}
          title="Share"
        >
          <Share2 size={18} />
        </button>

        <button
          type="button"
          className="danger-action"
          onClick={() =>
            onDelete(file)
          }
          aria-label={`Delete ${file.name}`}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default FileListRow;