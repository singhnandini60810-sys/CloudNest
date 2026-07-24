import {
  CheckCircle2,
  CloudUpload,
  File as FileIcon,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadCloudNestFile } from "../../services/cloudStorageService";
import Modal from "../common/Modal";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void | Promise<void>;
}

interface UploadItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadFileModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadFileModalProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setGeneralError("");

    setUploadItems((currentItems) => {
      const existingKeys = new Set(
        currentItems.map(({ file }) => getFileKey(file)),
      );

      const newItems: UploadItem[] = acceptedFiles
        .filter((file) => !existingKeys.has(getFileKey(file)))
        .map((file) => ({
          file,
          progress: 0,
          status: "pending",
        }));

      return [...currentItems, ...newItems];
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const updateUploadItem = (
    fileKey: string,
    updates: Partial<UploadItem>,
  ) => {
    setUploadItems((currentItems) =>
      currentItems.map((item) =>
        getFileKey(item.file) === fileKey
          ? { ...item, ...updates }
          : item,
      ),
    );
  };

  const removeFile = (fileToRemove: File) => {
    if (isUploading) {
      return;
    }

    setUploadItems((currentItems) =>
      currentItems.filter(
        ({ file }) => getFileKey(file) !== getFileKey(fileToRemove),
      ),
    );
  };

  const handleUpload = async () => {
    const pendingItems = uploadItems.filter(
      (item) => item.status !== "success",
    );

    if (pendingItems.length === 0 || isUploading) {
      return;
    }

    setIsUploading(true);
    setGeneralError("");

    let successfulUploads = 0;

    for (const item of pendingItems) {
      const fileKey = getFileKey(item.file);

      updateUploadItem(fileKey, {
        status: "uploading",
        progress: 0,
        error: undefined,
      });

      try {
        await uploadCloudNestFile(item.file, {
          onProgress: (progress) => {
            updateUploadItem(fileKey, { progress });
          },
        });

        updateUploadItem(fileKey, {
          status: "success",
          progress: 100,
        });

        successfulUploads += 1;
      } catch (error) {
        updateUploadItem(fileKey, {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "The file could not be uploaded.",
        });
      }
    }

    setIsUploading(false);

    if (successfulUploads > 0) {
      await onUploadComplete?.();
    }

    const allSucceeded = pendingItems.length === successfulUploads;

    if (allSucceeded) {
      setUploadItems([]);
      onClose();
    } else {
      setGeneralError(
        "Some files could not be uploaded. Review the errors and try again.",
      );
    }
  };

  const handleClose = () => {
    if (isUploading) {
      return;
    }

    setUploadItems([]);
    setGeneralError("");
    onClose();
  };

  const uploadableCount = uploadItems.filter(
    (item) => item.status !== "success",
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      title="Upload files"
      description="Add documents, images, videos and other files to CloudNest."
      size="large"
      onClose={handleClose}
    >
      <div
        {...getRootProps()}
        className={`upload-modal-zone ${
          isDragActive ? "upload-modal-zone--active" : ""
        }`}
      >
        <input {...getInputProps()} />

        <div className="upload-modal-zone__icon">
          <CloudUpload size={42} />
        </div>

        <h3>
          {isDragActive
            ? "Drop your files here"
            : "Drag and drop files here"}
        </h3>

        <p>or click to browse files from your computer</p>

        <button
          className="secondary-button"
          type="button"
          disabled={isUploading}
        >
          Browse Files
        </button>

        <small>Maximum size per file: 100 MB</small>
      </div>

      {fileRejections.length > 0 && (
        <p className="upload-modal__error">
          Some files were rejected because they exceed the 100 MB limit.
        </p>
      )}

      {generalError && (
        <p className="upload-modal__error">{generalError}</p>
      )}

      {uploadItems.length > 0 && (
        <div className="selected-files">
          <div className="selected-files__header">
            <h3>Selected files</h3>
            <span>{uploadItems.length}</span>
          </div>

          <div className="selected-files__list">
            {uploadItems.map((item) => {
              const fileKey = getFileKey(item.file);

              return (
                <div key={fileKey} className="selected-file">
                  <div className="selected-file__icon">
                    {item.status === "success" ? (
                      <CheckCircle2 size={20} />
                    ) : item.status === "uploading" ? (
                      <LoaderCircle
                        className="upload-spinner"
                        size={20}
                      />
                    ) : (
                      <FileIcon size={20} />
                    )}
                  </div>

                  <div className="selected-file__details">
                    <strong>{item.file.name}</strong>

                    <span>
                      {formatFileSize(item.file.size)}
                      {item.status === "uploading"
                        ? ` • ${item.progress}%`
                        : ""}
                      {item.status === "success"
                        ? " • Uploaded"
                        : ""}
                    </span>

                    {(item.status === "uploading" ||
                      item.status === "success") && (
                      <div className="upload-progress">
                        <div
                          className="upload-progress__bar"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {item.error && (
                      <small className="upload-modal__error">
                        {item.error}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => removeFile(item.file)}
                    aria-label={`Remove ${item.file.name}`}
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
          disabled={uploadableCount === 0 || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <LoaderCircle className="upload-spinner" size={19} />
          ) : (
            <CloudUpload size={19} />
          )}

          {isUploading
            ? "Uploading..."
            : `Upload${uploadableCount > 0 ? ` ${uploadableCount}` : ""}`}
        </button>
      </footer>
    </Modal>
  );
}

export default UploadFileModal;