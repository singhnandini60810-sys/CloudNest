import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useFiles } from "../../hooks/useFiles";
import type { CloudFile } from "../../types/file";

function getFileRecord(
  file: CloudFile,
): Record<string, unknown> {
  return file as unknown as Record<string, unknown>;
}

function getFileName(file: CloudFile): string {
  const record = getFileRecord(file);

  if (
    typeof record.name === "string" &&
    record.name.trim()
  ) {
    return record.name;
  }

  if (
    typeof record.fileName === "string" &&
    record.fileName.trim()
  ) {
    return record.fileName;
  }

  return "Untitled file";
}

function getTimestamp(file: CloudFile): number {
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
    return 0;
  }

  const timestamp = new Date(rawDate).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function getFileId(file: CloudFile): string {
  const record = getFileRecord(file);
  const fileName = getFileName(file);

  if (
    typeof record.fileId === "string" &&
    record.fileId.trim()
  ) {
    return record.fileId;
  }

  if (
    typeof record.id === "string" &&
    record.id.trim()
  ) {
    return record.id;
  }

  if (
    typeof record.key === "string" &&
    record.key.trim()
  ) {
    return record.key;
  }

  if (
    typeof record.s3Key === "string" &&
    record.s3Key.trim()
  ) {
    return record.s3Key;
  }

  return `${fileName}-${getTimestamp(file)}`;
}

function getExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (
    lastDotIndex === -1 ||
    lastDotIndex === fileName.length - 1
  ) {
    return "";
  }

  return fileName
    .slice(lastDotIndex + 1)
    .toLowerCase();
}

function getFormattedDate(file: CloudFile): string {
  const timestamp = getTimestamp(file);

  if (!timestamp) {
    return "Recently";
  }

  return new Date(timestamp).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function getFileSize(file: CloudFile): number {
  const record = getFileRecord(file);

  const possibleValues = [
    record.sizeInBytes,
    record.size,
    record.fileSize,
    record.file_size,
  ];

  for (const value of possibleValues) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
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

function getFileIcon(fileName: string) {
  const extension = getExtension(fileName);

  const imageExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
  ];

  const videoExtensions = [
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "mpeg",
    "mpg",
  ];

  const audioExtensions = [
    "mp3",
    "wav",
    "ogg",
    "aac",
    "m4a",
    "flac",
  ];

  const archiveExtensions = [
    "zip",
    "rar",
    "7z",
    "tar",
    "gz",
    "bz2",
  ];

  const spreadsheetExtensions = [
    "xls",
    "xlsx",
    "csv",
    "ods",
  ];

  const presentationExtensions = [
    "ppt",
    "pptx",
    "odp",
  ];

  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "md",
    "rtf",
    "odt",
  ];

  if (imageExtensions.includes(extension)) {
    return FileImage;
  }

  if (videoExtensions.includes(extension)) {
    return FileVideo;
  }

  if (audioExtensions.includes(extension)) {
    return FileAudio;
  }

  if (archiveExtensions.includes(extension)) {
    return FileArchive;
  }

  if (spreadsheetExtensions.includes(extension)) {
    return FileSpreadsheet;
  }

  if (presentationExtensions.includes(extension)) {
    return Presentation;
  }

  if (documentExtensions.includes(extension)) {
    return FileText;
  }

  return File;
}

function RecentFiles() {
  const navigate = useNavigate();
  const { files, isLoading } = useFiles();

  const recentFiles = useMemo(() => {
    return [...files]
      .sort(
        (firstFile, secondFile) =>
          getTimestamp(secondFile) -
          getTimestamp(firstFile),
      )
      .slice(0, 5);
  }, [files]);

  function handleOpenFiles() {
    navigate("/files");
  }

  return (
    <article className="dashboard-card recent-files-card">
      <div className="dashboard-card__header">
        <div>
          <h3>Recent Files</h3>
          <p>Your latest uploaded files</p>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={handleOpenFiles}
        >
          See All
        </button>
      </div>

      <div className="recent-files-list">
        {isLoading ? (
          <div className="files-empty-state">
            <div className="upload-spinner" />

            <p>Loading recent files...</p>
          </div>
        ) : recentFiles.length === 0 ? (
          <div className="files-empty-state">
            <FileText size={35} />

            <h3>No files yet</h3>

            <p>
              Upload your first file to see it here.
            </p>
          </div>
        ) : (
          recentFiles.map((file) => {
            const fileName = getFileName(file);
            const fileId = getFileId(file);
            const Icon = getFileIcon(fileName);

            const extension =
              getExtension(fileName).toUpperCase() ||
              "FILE";

            return (
              <button
                key={fileId}
                className="recent-file recent-file--button"
                type="button"
                onClick={handleOpenFiles}
                aria-label={`Open ${fileName} in My Files`}
              >
                <div className="recent-file__icon">
                  <Icon size={21} />
                </div>

                <div className="recent-file__details">
                  <strong title={fileName}>
                    {fileName}
                  </strong>

                  <span>
                    {formatFileSize(getFileSize(file))}
                    {" • "}
                    {extension}
                  </span>
                </div>

                <time>
                  {getFormattedDate(file)}
                </time>
              </button>
            );
          })
        )}
      </div>

      {!isLoading && recentFiles.length > 0 && (
        <button
          className="recent-files-card__footer"
          type="button"
          onClick={handleOpenFiles}
        >
          See All Files
        </button>
      )}
    </article>
  );
}

export default RecentFiles;