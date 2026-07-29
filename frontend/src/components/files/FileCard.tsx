import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  Share2,
  Star,
  Trash2,
} from "lucide-react";

import type { CSSProperties } from "react";
import type { CloudFile } from "../../types/file";

interface FileCardProps {
  file: CloudFile;
  onToggleFavorite: (fileId: string) => void;
  onDownload: (file: CloudFile) => void;
  onShare: (file: CloudFile) => void;
  onDelete: (file: CloudFile) => void;
}

function getFileRecord(
  file: CloudFile,
): Record<string, unknown> {
  return file as unknown as Record<string, unknown>;
}

function getFileId(file: CloudFile): string {
  const record = getFileRecord(file);

  const possibleIds = [
    record.fileId,
    record.id,
    record.file_id,
    record.key,
    record.s3Key,
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

function getFileName(file: CloudFile): string {
  const record = getFileRecord(file);

  const possibleNames = [
    record.name,
    record.fileName,
    record.file_name,
    record.originalName,
  ];

  for (const value of possibleNames) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value;
    }
  }

  return "Untitled file";
}

function getContentType(
  file: CloudFile,
): string {
  const record = getFileRecord(file);

  const possibleContentTypes = [
    record.contentType,
    record.content_type,
    record.mimeType,
    record.type,
  ];

  for (const value of possibleContentTypes) {
    if (typeof value === "string") {
      return value.toLowerCase();
    }
  }

  return "";
}

function getExtension(
  fileName: string,
): string {
  const dotIndex = fileName.lastIndexOf(".");

  if (
    dotIndex === -1 ||
    dotIndex === fileName.length - 1
  ) {
    return "";
  }

  return fileName
    .slice(dotIndex + 1)
    .toLowerCase();
}

function getFileSize(
  file: CloudFile,
): number {
  const record = getFileRecord(file);

  const possibleSizes = [
    record.sizeInBytes,
    record.size,
    record.fileSize,
    record.file_size,
  ];

  for (const value of possibleSizes) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsedSize = Number(value);

      if (!Number.isNaN(parsedSize)) {
        return parsedSize;
      }
    }
  }

  return 0;
}

function formatFileSize(
  bytes: number,
): string {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  if (megabytes < 1024) {
    return `${megabytes.toFixed(1)} MB`;
  }

  const gigabytes = megabytes / 1024;

  return `${gigabytes.toFixed(1)} GB`;
}

function getCreatedAt(
  file: CloudFile,
): string {
  const record = getFileRecord(file);

  const rawDate =
    record.createdAt ??
    record.uploadedAt ??
    record.updatedAt ??
    record.created_at ??
    record.uploaded_at ??
    record.updated_at;

  if (
    typeof rawDate !== "string" &&
    typeof rawDate !== "number"
  ) {
    return "Recently uploaded";
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return String(rawDate);
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getIsFavorite(
  file: CloudFile,
): boolean {
  return getFileRecord(file).isFavorite === true;
}

function getFileTypeLabel(
  fileName: string,
): string {
  const extension = getExtension(fileName);

  return extension
    ? extension.toUpperCase()
    : "FILE";
}

function renderFileIcon(
  file: CloudFile,
) {
  const fileName = getFileName(file);
  const extension = getExtension(fileName);
  const contentType = getContentType(file);
  const iconSize = 48;

  if (
    contentType.startsWith("image/") ||
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "bmp",
    ].includes(extension)
  ) {
    return <FileImage size={iconSize} />;
  }

  if (
    contentType.startsWith("video/") ||
    [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
      "m4v",
    ].includes(extension)
  ) {
    return <FileVideo size={iconSize} />;
  }

  if (
    contentType.startsWith("audio/") ||
    [
      "mp3",
      "wav",
      "ogg",
      "aac",
      "m4a",
      "flac",
    ].includes(extension)
  ) {
    return <FileAudio size={iconSize} />;
  }

  if (
    [
      "xls",
      "xlsx",
      "csv",
      "ods",
    ].includes(extension)
  ) {
    return <FileSpreadsheet size={iconSize} />;
  }

  if (
    [
      "ppt",
      "pptx",
      "odp",
    ].includes(extension)
  ) {
    return <Presentation size={iconSize} />;
  }

  if (
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
    ].includes(extension)
  ) {
    return <FileArchive size={iconSize} />;
  }

  if (
    contentType.includes("pdf") ||
    [
      "pdf",
      "doc",
      "docx",
      "txt",
      "rtf",
      "md",
      "odt",
    ].includes(extension)
  ) {
    return <FileText size={iconSize} />;
  }

  return <File size={iconSize} />;
}

const styles: Record<
  string,
  CSSProperties
> = {
  card: {
    position: "relative",
    display: "flex",
    minWidth: 0,
    minHeight: "260px",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow:
      "0 8px 24px rgba(15, 23, 42, 0.06)",
    transition:
      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
  },

  visual: {
    position: "relative",
    display: "flex",
    minHeight: "138px",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #edf2f7",
    background:
      "linear-gradient(145deg, #f8fafc 0%, #eef3f8 100%)",
    color: "#0b2a56",
  },

  typeBadge: {
    position: "absolute",
    top: "14px",
    left: "14px",
    padding: "5px 9px",
    border: "1px solid #dbe4ee",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.06em",
  },

  favorite: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "inline-flex",
    width: "36px",
    height: "36px",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #dbe4ee",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
  },

  favoriteDisabled: {
    cursor: "not-allowed",
    opacity: 0.55,
  },

  favoriteActive: {
    color: "#d89b28",
    background: "#fff8e7",
    borderColor: "#f4d99d",
  },

  content: {
    display: "flex",
    minWidth: 0,
    flex: 1,
    flexDirection: "column",
    padding: "18px",
  },

  name: {
    overflow: "hidden",
    margin: 0,
    color: "#0b2348",
    fontSize: "15px",
    fontWeight: 750,
    lineHeight: 1.4,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "7px",
    marginTop: "7px",
    color: "#718096",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginTop: "auto",
    paddingTop: "18px",
  },

  actionButton: {
    display: "inline-flex",
    minWidth: 0,
    height: "38px",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #dbe4ee",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
  },

  deleteButton: {
    borderColor: "#fecaca",
    background: "#fff5f5",
    color: "#dc2626",
  },
};

function FileCard({
  file,
  onToggleFavorite,
  onDownload,
  onShare,
  onDelete,
}: FileCardProps) {
  const fileId = getFileId(file);
  const fileName = getFileName(file);
  const fileSize = formatFileSize(
    getFileSize(file),
  );
  const createdAt = getCreatedAt(file);
  const isFavorite = getIsFavorite(file);
  const fileType = getFileTypeLabel(fileName);

  return (
    <article
      style={styles.card}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-3px)";

        event.currentTarget.style.boxShadow =
          "0 14px 34px rgba(15, 23, 42, 0.11)";

        event.currentTarget.style.borderColor =
          "#cbd5e1";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";

        event.currentTarget.style.boxShadow =
          "0 8px 24px rgba(15, 23, 42, 0.06)";

        event.currentTarget.style.borderColor =
          "#e2e8f0";
      }}
    >
      <div style={styles.visual}>
        <span style={styles.typeBadge}>
          {fileType}
        </span>

        <button
          type="button"
          disabled={!fileId}
          style={{
            ...styles.favorite,
            ...(isFavorite
              ? styles.favoriteActive
              : {}),
            ...(!fileId
              ? styles.favoriteDisabled
              : {}),
          }}
          aria-label={
            isFavorite
              ? `Remove ${fileName} from favorites`
              : `Add ${fileName} to favorites`
          }
          title={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          onClick={() => {
            if (fileId) {
              onToggleFavorite(fileId);
            }
          }}
        >
          <Star
            size={18}
            fill={
              isFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {renderFileIcon(file)}
      </div>

      <div style={styles.content}>
        <h4
          style={styles.name}
          title={fileName}
        >
          {fileName}
        </h4>

        <div style={styles.meta}>
          <span>{fileSize}</span>

          <span aria-hidden="true">•</span>

          <span>{createdAt}</span>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.actionButton}
            aria-label={`Download ${fileName}`}
            title="Download"
            onClick={() => onDownload(file)}
          >
            <Download size={17} />
          </button>

          <button
            type="button"
            style={styles.actionButton}
            aria-label={`Share ${fileName}`}
            title="Share"
            onClick={() => onShare(file)}
          >
            <Share2 size={17} />
          </button>

          <button
            type="button"
            style={{
              ...styles.actionButton,
              ...styles.deleteButton,
            }}
            aria-label={`Delete ${fileName}`}
            title="Delete"
            onClick={() => onDelete(file)}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default FileCard;