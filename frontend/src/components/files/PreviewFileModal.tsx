import {
  Download,
  FileArchive,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  Share2,
} from "lucide-react";
import type { CloudFile } from "../../types/file";
import Modal from "../common/Modal";

interface PreviewFileModalProps {
  file: CloudFile | null;
  onClose: () => void;
  onDownload: (file: CloudFile) => void;
  onShare: (file: CloudFile) => void;
}

const previewIcons = {
  document: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileMusic,
  archive: FileArchive,
  other: FileText,
};

function PreviewFileModal({
  file,
  onClose,
  onDownload,
  onShare,
}: PreviewFileModalProps) {
  if (!file) {
    return null;
  }

  const Icon = previewIcons[file.category];

  return (
    <Modal
      isOpen={Boolean(file)}
      title="File preview"
      description="Review file information before downloading or sharing."
      size="large"
      onClose={onClose}
    >
      <div className="file-preview">
        <div
          className={`file-preview__visual file-preview__visual--${file.category}`}
        >
          <Icon size={82} strokeWidth={1.3} />
          <span>{file.extension}</span>
        </div>

        <div className="file-preview__details">
          <span className={`file-extension file-extension--${file.category}`}>
            {file.extension}
          </span>

          <h3>{file.name}</h3>

          <div className="file-preview__metadata">
            <div>
              <span>File size</span>
              <strong>{file.size}</strong>
            </div>

            <div>
              <span>File category</span>
              <strong>{file.category}</strong>
            </div>

            <div>
              <span>Uploaded</span>
              <strong>{file.uploadedAt}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>Securely stored</strong>
            </div>
          </div>

          <div className="file-preview__notice">
            The full file preview will be loaded from Amazon S3 after AWS
            integration.
          </div>
        </div>
      </div>

      <footer className="modal__footer">
        <button
          className="secondary-button"
          type="button"
          onClick={() => onShare(file)}
        >
          <Share2 size={18} />
          Share
        </button>

        <button
          className="primary-button"
          type="button"
          onClick={() => onDownload(file)}
        >
          <Download size={18} />
          Download
        </button>
      </footer>
    </Modal>
  );
}

export default PreviewFileModal;