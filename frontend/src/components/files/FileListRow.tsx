import {
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  MoreHorizontal,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import type { CloudFile } from "../../types/file";

interface FileListRowProps {
  file: CloudFile;
  onToggleFavorite: (fileId: string) => void;
  onPreview: (file: CloudFile) => void;
  onDownload: (file: CloudFile) => void;
  onShare: (file: CloudFile) => void;
  onDelete: (file: CloudFile) => void;
}

const categoryIcons = {
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileMusic,
  archive: FileArchive,
  other: FileText,
};

function FileListRow({
  file,
  onToggleFavorite,
  onPreview,
  onDownload,
  onShare,
  onDelete,
}: FileListRowProps) {
  const Icon = categoryIcons[file.category];

  return (
    <div className="file-list-row">
      <button
        type="button"
        className="file-list-row__name"
        onClick={() => onPreview(file)}
      >
        <span
          className={`file-list-row__icon file-list-row__icon--${file.category}`}
        >
          <Icon size={22} />
        </span>

        <strong>{file.name}</strong>
      </button>

      <span className="file-list-row__category">{file.category}</span>

      <span>{file.size}</span>

      <time>{file.uploadedAt}</time>

      <div className="file-list-row__actions">
        <button
          type="button"
          onClick={() => onPreview(file)}
          aria-label={`Preview ${file.name}`}
        >
          <Eye size={18} />
        </button>

        <button
          type="button"
          className={file.isFavorite ? "favorite-active" : ""}
          onClick={() => onToggleFavorite(file.id)}
          aria-label={`Favorite ${file.name}`}
        >
          <Star
            size={18}
            fill={file.isFavorite ? "currentColor" : "none"}
          />
        </button>

        <button
          type="button"
          onClick={() => onDownload(file)}
          aria-label={`Download ${file.name}`}
        >
          <Download size={18} />
        </button>

        <button
          type="button"
          onClick={() => onShare(file)}
          aria-label={`Share ${file.name}`}
        >
          <Share2 size={18} />
        </button>

        <button
          type="button"
          className="danger-action"
          onClick={() => onDelete(file)}
          aria-label={`Delete ${file.name}`}
        >
          <Trash2 size={18} />
        </button>

        <button type="button" aria-label={`More options for ${file.name}`}>
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

export default FileListRow;