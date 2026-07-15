import { CloudUpload, File, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "../common/Modal";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function formatFileSize(bytes: number) {
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
  onUpload,
}: UploadFileModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map((file) => `${file.name}-${file.size}`),
      );

      const uniqueFiles = acceptedFiles.filter(
        (file) => !existingKeys.has(`${file.name}-${file.size}`),
      );

      return [...currentFiles, ...uniqueFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      multiple: true,
      maxSize: MAX_FILE_SIZE,
    });

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size
          ),
      ),
    );
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      return;
    }

    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

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
          {isDragActive ? "Drop your files here" : "Drag and drop files here"}
        </h3>

        <p>or click to browse files from your computer</p>

        <button className="secondary-button" type="button">
          Browse Files
        </button>

        <small>Maximum size per file: 100 MB</small>
      </div>

      {fileRejections.length > 0 && (
        <p className="upload-modal__error">
          Some files were rejected because they exceed the 100 MB limit.
        </p>
      )}

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="selected-files__header">
            <h3>Selected files</h3>
            <span>{selectedFiles.length}</span>
          </div>

          <div className="selected-files__list">
            {selectedFiles.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="selected-file"
              >
                <div className="selected-file__icon">
                  <File size={20} />
                </div>

                <div className="selected-file__details">
                  <strong>{file.name}</strong>
                  <span>{formatFileSize(file.size)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="modal__footer">
        <button className="secondary-button" type="button" onClick={handleClose}>
          Cancel
        </button>

        <button
          className="primary-button"
          type="button"
          disabled={selectedFiles.length === 0}
          onClick={handleUpload}
        >
          <CloudUpload size={19} />
          Upload {selectedFiles.length > 0 ? selectedFiles.length : ""}
        </button>
      </footer>
    </Modal>
  );
}

export default UploadFileModal;