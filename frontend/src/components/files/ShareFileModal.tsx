import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CloudFile } from "../../types/file";
import Modal from "../common/Modal";

interface ShareFileModalProps {
  file: CloudFile | null;
  onClose: () => void;
}

function ShareFileModal({ file, onClose }: ShareFileModalProps) {
  const [expiresIn, setExpiresIn] = useState("15");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
    setExpiresIn("15");
  }, [file]);

  const shareUrl = useMemo(() => {
    if (!file) {
      return "";
    }

    const baseUrl = window.location.origin;
    const expiryTime =
      Date.now() + Number(expiresIn) * 60 * 1000;

    return `${baseUrl}/shared/${encodeURIComponent(
      file.id,
    )}?expires=${expiryTime}`;
  }, [expiresIn, file]);

  if (!file) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = shareUrl;
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";

      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand("copy");
      document.body.removeChild(temporaryInput);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <Modal
      isOpen={Boolean(file)}
      title="Share file"
      description={`Create a temporary secure link for ${file.name}.`}
      onClose={onClose}
    >
      <div className="share-modal">
        <div className="share-modal__file">
          <div className="share-modal__file-icon">
            <Link2 size={22} />
          </div>

          <div>
            <strong>{file.name}</strong>
            <span>
              {file.size} · {file.extension}
            </span>
          </div>
        </div>

        <label className="modal-field">
          <span>Link expiration</span>

          <select
            value={expiresIn}
            onChange={(event) => setExpiresIn(event.target.value)}
          >
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="60">1 hour</option>
            <option value="1440">24 hours</option>
          </select>
        </label>

        <div className="share-link-box">
          <input
            type="text"
            value={shareUrl}
            readOnly
            aria-label="Generated sharing link"
          />

          <button type="button" onClick={handleCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="share-modal__security">
          This is a temporary frontend demonstration link. During AWS
          integration, Lambda will generate a real private S3 presigned URL.
        </div>
      </div>

      <footer className="modal__footer">
        <button
          className="secondary-button"
          type="button"
          onClick={onClose}
        >
          Close
        </button>

        <button
          className="primary-button"
          type="button"
          onClick={handleCopy}
        >
          <ExternalLink size={18} />
          {copied ? "Link copied" : "Copy secure link"}
        </button>
      </footer>
    </Modal>
  );
}

export default ShareFileModal;