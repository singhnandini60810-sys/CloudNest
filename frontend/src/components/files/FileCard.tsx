import {
  Download,
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
}

const categoryIcons = {
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileMusic,
  archive: FileArchive,
  other: FileText,
};

function FileCard({ file, onToggleFavorite }: FileCardProps) {
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

          <button
            type="button"
            aria-label={`More options for ${file.name}`}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div
        className={`cloud-file-card__preview cloud-file-card__preview--${file.category}`}
      >
        <Icon size={52} strokeWidth={1.45} />
      </div>

      <div className="cloud-file-card__content">
        <h3 title={file.name}>{file.name}</h3>

        <p>
          {file.size} · {file.uploadedAt}
        </p>
      </div>

      <div className="cloud-file-card__actions">
        <button type="button" aria-label={`Download ${file.name}`}>
          <Download size={18} />
        </button>

        <button type="button" aria-label={`Share ${file.name}`}>
          <Share2 size={18} />
        </button>

        <button
          type="button"
          className="danger-action"
          aria-label={`Delete ${file.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}

export default FileCard;