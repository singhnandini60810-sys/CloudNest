import {
  Check,
  Copy,
  Link2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type { CloudFile } from "../../types/file";
import { getCloudNestFileUrl } from "../../services/fileService";
import Modal from "../common/Modal";

interface ShareFileModalProps {
  file: CloudFile | null;
  onClose: () => void;
}

function getFileRecord(
  file: CloudFile,
): Record<string, unknown> {
  return file as unknown as Record<string, unknown>;
}

function getFileId(
  file: CloudFile,
): string {
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

function getFileName(
  file: CloudFile,
): string {
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

function getFileSizeLabel(
  file: CloudFile,
): string {
  const record = getFileRecord(file);

  if (
    typeof record.size === "string" &&
    record.size.trim()
  ) {
    return record.size;
  }

  const rawSize =
    record.sizeInBytes ??
    record.fileSize ??
    record.file_size ??
    record.size;

  if (
    typeof rawSize !== "number" ||
    !Number.isFinite(rawSize) ||
    rawSize <= 0
  ) {
    return "Size unavailable";
  }

  if (rawSize < 1024) {
    return `${rawSize} B`;
  }

  const kilobytes = rawSize / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  if (megabytes < 1024) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${(megabytes / 1024).toFixed(1)} GB`;
}

function getFileExtension(
  fileName: string,
): string {
  const dotIndex =
    fileName.lastIndexOf(".");

  if (
    dotIndex === -1 ||
    dotIndex === fileName.length - 1
  ) {
    return "FILE";
  }

  return fileName
    .slice(dotIndex + 1)
    .toUpperCase();
}

async function copyText(
  value: string,
): Promise<void> {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(
      value,
    );

    return;
  }

  const temporaryInput =
    document.createElement("textarea");

  temporaryInput.value = value;
  temporaryInput.setAttribute(
    "readonly",
    "",
  );

  temporaryInput.style.position =
    "fixed";
  temporaryInput.style.left = "-9999px";
  temporaryInput.style.opacity = "0";

  document.body.appendChild(
    temporaryInput,
  );

  temporaryInput.select();
  temporaryInput.setSelectionRange(
    0,
    temporaryInput.value.length,
  );

  const copied =
    document.execCommand("copy");

  temporaryInput.remove();

  if (!copied) {
    throw new Error(
      "The sharing link could not be copied.",
    );
  }
}

function ShareFileModal({
  file,
  onClose,
}: ShareFileModalProps) {
  const [shareUrl, setShareUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setShareUrl("");
    setCopied(false);
    setIsGenerating(false);
    setError("");
  }, [file]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setCopied(false);
      },
      2000,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  if (!file) {
    return null;
  }

  const fileId = getFileId(file);
  const fileName = getFileName(file);
  const fileSize =
    getFileSizeLabel(file);
  const extension =
    getFileExtension(fileName);

  async function handleGenerateLink() {
    if (!fileId || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setCopied(false);
    setError("");

    try {
      const response =
       await getCloudNestFileUrl(fileId);
        

      if (
        !response.url ||
        typeof response.url !== "string"
      ) {
        throw new Error(
          "The backend did not return a sharing link.",
        );
      }

      setShareUrl(response.url);
    } catch (generateError) {
      console.error(
        "CloudNest share-link generation failed:",
        generateError,
      );

      setShareUrl("");

      setError(
        generateError instanceof Error
          ? generateError.message
          : "The sharing link could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    setError("");

    try {
      await copyText(shareUrl);
      setCopied(true);
    } catch (copyError) {
      console.error(
        "CloudNest share-link copy failed:",
        copyError,
      );

      setCopied(false);

      setError(
        copyError instanceof Error
          ? copyError.message
          : "The sharing link could not be copied.",
      );
    }
  }

  function handleClose() {
    if (isGenerating) {
      return;
    }

    onClose();
  }

  return (
    <Modal
      isOpen={Boolean(file)}
      title="Share File"
      description={`Generate a secure temporary link for ${fileName}.`}
      onClose={handleClose}
    >
      <div className="share-modal">
        <div className="share-modal__file">
          <div className="share-modal__file-icon">
            <Link2
              size={22}
              aria-hidden="true"
            />
          </div>

          <div>
            <strong title={fileName}>
              {fileName}
            </strong>

            <span>
              {fileSize} · {extension}
            </span>
          </div>
        </div>

        {!shareUrl ? (
          <div className="share-modal__security">
            CloudNest will request a temporary
            presigned link from AWS. Anyone with
            the generated link can access this file
            until the link expires.
          </div>
        ) : (
          <div className="share-link-box">
            <input
              type="text"
              value={shareUrl}
              readOnly
              aria-label="Generated secure sharing link"
              onFocus={(event) => {
                event.currentTarget.select();
              }}
            />

            <button
              type="button"
              onClick={() => {
                void handleCopy();
              }}
              disabled={!shareUrl}
            >
              {copied ? (
                <Check
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Copy
                  size={18}
                  aria-hidden="true"
                />
              )}

              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}

        {error && (
          <p
            className="modal-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <footer className="modal__footer">
        <button
          className="secondary-button"
          type="button"
          onClick={handleClose}
          disabled={isGenerating}
        >
          Close
        </button>

        {!shareUrl ? (
          <button
            className="primary-button"
            type="button"
            disabled={
              !fileId ||
              isGenerating
            }
            onClick={() => {
              void handleGenerateLink();
            }}
          >
            {isGenerating ? (
              <LoaderCircle
                size={18}
                className="upload-spinner"
                aria-hidden="true"
              />
            ) : (
              <Link2
                size={18}
                aria-hidden="true"
              />
            )}

            {isGenerating
              ? "Generating..."
              : "Generate Secure Link"}
          </button>
        ) : (
          <>
            <button
              className="secondary-button"
              type="button"
              disabled={isGenerating}
              onClick={() => {
                void handleGenerateLink();
              }}
            >
              <RefreshCw
                size={18}
                className={
                  isGenerating
                    ? "upload-spinner"
                    : undefined
                }
                aria-hidden="true"
              />

              Generate New Link
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={() => {
                void handleCopy();
              }}
            >
              {copied ? (
                <Check
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Copy
                  size={18}
                  aria-hidden="true"
                />
              )}

              {copied
                ? "Link Copied"
                : "Copy Link"}
            </button>
          </>
        )}
      </footer>
    </Modal>
  );
}

export default ShareFileModal;