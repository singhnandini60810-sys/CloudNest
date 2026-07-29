import {
  CheckCircle2,
  CloudUpload,
  File as FileIcon,
  LoaderCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  type FileRejection,
  useDropzone,
} from "react-dropzone";

import { uploadCloudNestFile } from "../../services/cloudStorageService";
import Modal from "../common/Modal";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void | Promise<void>;
}

type UploadStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error";

interface UploadItem {
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

const MAX_FILE_SIZE =
  25 * 1024 * 1024;

function getFileKey(file: File): string {
  return [
    file.name,
    file.size,
    file.lastModified,
  ].join("-");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getRejectionMessage(
  rejection: FileRejection,
): string {
  const error = rejection.errors[0];

  if (!error) {
    return `${rejection.file.name} could not be selected.`;
  }

  if (error.code === "file-too-large") {
    return `${rejection.file.name} exceeds the 25 MB limit.`;
  }

  if (error.code === "too-many-files") {
    return "Too many files were selected.";
  }

  return `${rejection.file.name}: ${error.message}`;
}

function UploadFileModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadFileModalProps) {
  const [uploadItems, setUploadItems] =
    useState<UploadItem[]>([]);

  const [isUploading, setIsUploading] =
    useState(false);

  const [generalError, setGeneralError] =
    useState("");

  const addAcceptedFiles = useCallback(
    (acceptedFiles: File[]) => {
      setUploadItems((currentItems) => {
        const existingKeys = new Set(
          currentItems.map(({ file }) =>
            getFileKey(file),
          ),
        );

        const newItems = acceptedFiles
          .filter(
            (file) =>
              !existingKeys.has(
                getFileKey(file),
              ),
          )
          .map<UploadItem>((file) => ({
            file,
            progress: 0,
            status: "pending",
          }));

        return [
          ...currentItems,
          ...newItems,
        ];
      });
    },
    [],
  );

  const handleDrop = useCallback(
    (
      acceptedFiles: File[],
      rejectedFiles: FileRejection[],
    ) => {
      setGeneralError("");

      if (acceptedFiles.length > 0) {
        addAcceptedFiles(acceptedFiles);
      }

      if (rejectedFiles.length > 0) {
        setGeneralError(
          rejectedFiles
            .map(getRejectionMessage)
            .join(" "),
        );
      }
    },
    [addAcceptedFiles],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
    noClick: true,
    noKeyboard: true,

    // No accept restriction is used.
    // CloudNest allows any file type that S3 can store.
  });

  const uploadableCount = useMemo(
    () =>
      uploadItems.filter(
        (item) =>
          item.status === "pending" ||
          item.status === "error",
      ).length,
    [uploadItems],
  );

  function updateUploadItem(
    fileKey: string,
    updates: Partial<UploadItem>,
  ) {
    setUploadItems((currentItems) =>
      currentItems.map((item) =>
        getFileKey(item.file) === fileKey
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    );
  }

  function removeFile(
    fileToRemove: File,
  ) {
    if (isUploading) {
      return;
    }

    setUploadItems((currentItems) =>
      currentItems.filter(
        ({ file }) =>
          getFileKey(file) !==
          getFileKey(fileToRemove),
      ),
    );

    setGeneralError("");
  }

  function clearCompletedFiles() {
    if (isUploading) {
      return;
    }

    setUploadItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.status !== "success",
      ),
    );
  }

  async function handleUpload() {
    if (
      uploadableCount === 0 ||
      isUploading
    ) {
      return;
    }

    const itemsToUpload =
      uploadItems.filter(
        (item) =>
          item.status === "pending" ||
          item.status === "error",
      );

    setIsUploading(true);
    setGeneralError("");

    let successfulUploads = 0;
    let failedUploads = 0;

    for (const item of itemsToUpload) {
      const fileKey =
        getFileKey(item.file);

      updateUploadItem(fileKey, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

      try {
        await uploadCloudNestFile(
          item.file,
          {
            onProgress: (progress) => {
              updateUploadItem(
                fileKey,
                {
                  progress: Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(progress),
                    ),
                  ),
                },
              );
            },
          },
        );

        updateUploadItem(fileKey, {
          status: "success",
          progress: 100,
          error: undefined,
        });

        successfulUploads += 1;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The file could not be uploaded.";

        updateUploadItem(fileKey, {
          status: "error",
          progress: 0,
          error: message,
        });

        failedUploads += 1;
      }
    }

    setIsUploading(false);

    if (successfulUploads > 0) {
      await onUploadComplete?.();
    }

    if (
      successfulUploads > 0 &&
      failedUploads === 0
    ) {
      setUploadItems([]);
      setGeneralError("");
      onClose();
      return;
    }

    if (failedUploads > 0) {
      setGeneralError(
        `${failedUploads} ${
          failedUploads === 1
            ? "file"
            : "files"
        } could not be uploaded. Review the error below and try again.`,
      );
    }
  }

  function handleClose() {
    if (isUploading) {
      return;
    }

    setUploadItems([]);
    setGeneralError("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Upload files"
      description="Upload files securely to your CloudNest storage."
      size="large"
      onClose={handleClose}
    >
      <div
        {...getRootProps()}
        className={`upload-modal-zone ${
          isDragActive
            ? "upload-modal-zone--active"
            : ""
        }`}
      >
        <input {...getInputProps()} />

        <div className="upload-modal-zone__icon">
          <CloudUpload size={42} />
        </div>

        <h3>
          {isDragActive
            ? "Drop files to add them"
            : "Drag and drop files here"}
        </h3>

        <p>
          Select one or more files from
          your computer.
        </p>

        <button
          className="secondary-button"
          type="button"
          disabled={isUploading}
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
        >
          Browse Files
        </button>

        <small>
          Maximum size per file: 25 MB
        </small>
      </div>

      {generalError && (
        <div
          className="upload-modal__error"
          role="alert"
        >
          <XCircle size={18} />

          <span>{generalError}</span>
        </div>
      )}

      {uploadItems.length > 0 && (
        <div className="selected-files">
          <div className="selected-files__header">
            <div>
              <h3>Selected files</h3>

              <span>
                {uploadItems.length}
              </span>
            </div>

            {uploadItems.some(
              (item) =>
                item.status ===
                "success",
            ) && (
              <button
                className="selected-files__clear"
                type="button"
                disabled={isUploading}
                onClick={
                  clearCompletedFiles
                }
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="selected-files__list">
            {uploadItems.map((item) => {
              const fileKey =
                getFileKey(item.file);

              const canRemove =
                !isUploading &&
                item.status !==
                  "uploading";

              return (
                <div
                  key={fileKey}
                  className={`selected-file selected-file--${item.status}`}
                >
                  <div className="selected-file__icon">
                    {item.status ===
                    "success" ? (
                      <CheckCircle2
                        size={20}
                      />
                    ) : item.status ===
                      "uploading" ? (
                      <LoaderCircle
                        className="upload-spinner"
                        size={20}
                      />
                    ) : item.status ===
                      "error" ? (
                      <XCircle size={20} />
                    ) : (
                      <FileIcon size={20} />
                    )}
                  </div>

                  <div className="selected-file__details">
                    <strong
                      title={item.file.name}
                    >
                      {item.file.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        item.file.size,
                      )}

                      {item.status ===
                      "uploading"
                        ? ` • ${item.progress}%`
                        : ""}

                      {item.status ===
                      "success"
                        ? " • Uploaded"
                        : ""}

                      {item.status ===
                      "error"
                        ? " • Failed"
                        : ""}
                    </span>

                    {(item.status ===
                      "uploading" ||
                      item.status ===
                        "success") && (
                      <div className="upload-progress">
                        <div
                          className="upload-progress__bar"
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>
                    )}

                    {item.error && (
                      <small
                        className="upload-modal__file-error"
                        role="alert"
                      >
                        {item.error}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canRemove}
                    onClick={() =>
                      removeFile(item.file)
                    }
                    aria-label={`Remove ${item.file.name}`}
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <footer className="modal__footer">
        <button
          className="secondary-button"
          type="button"
          disabled={isUploading}
          onClick={handleClose}
        >
          Cancel
        </button>

        <button
          className="primary-button"
          type="button"
          disabled={
            uploadableCount === 0 ||
            isUploading
          }
          onClick={() => {
            void handleUpload();
          }}
        >
          {isUploading ? (
            <LoaderCircle
              className="upload-spinner"
              size={19}
            />
          ) : (
            <CloudUpload size={19} />
          )}

          {isUploading
            ? "Uploading..."
            : uploadableCount === 1
              ? "Upload 1 file"
              : `Upload ${uploadableCount} files`}
        </button>
      </footer>
    </Modal>
  );
}

export default UploadFileModal;