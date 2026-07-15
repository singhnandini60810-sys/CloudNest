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

interface FileCardProps {
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

function FileCard({
  file,
  onToggleFavorite,
  onPreview,
  onDownload,
  onShare,
  onDelete,
}: FileCardProps) {
  const Icon = categoryIcons[file.category];

  return (
    <article className="cloud-file-card">
      <div className="cloud-file-card__header">
        <span className={`file-extension file-extension--${file.category}`}>
          {file.extension}
        </span>

        <div className="cloud-file-card__header-actions">
          <button
            type="button"
            className={file.isFavorite ? "favorite-active" : ""}
            onClick={() => onToggleFavorite(file.id)}
            aria-label={
              file.isFavorite
                ? `Remove ${file.name} from favorites`
                : `Add ${file.name} to favorites`
            }
          >
            <Star
              size={19}
              fill={file.isFavorite ? "currentColor" : "none"}
            />
          </button>

          <button type="button" aria-label={`More options for ${file.name}`}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`cloud-file-card__preview cloud-file-card__preview--${file.category}`}
        onClick={() => onPreview(file)}
        aria-label={`Preview ${file.name}`}
      >
        <Icon size={52} strokeWidth={1.45} />

        <span className="cloud-file-card__preview-label">
          <Eye size={16} />
          Preview
        </span>
      </button>

      <div className="cloud-file-card__content">
        <h3 title={file.name}>{file.name}</h3>

        <p>
          {file.size} · {file.uploadedAt}
        </p>
      </div>

      <div className="cloud-file-card__actions">
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
      </div>
    </article>
  );
}

export default FileCard;