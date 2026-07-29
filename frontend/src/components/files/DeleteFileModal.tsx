import {
  Trash2,
  TriangleAlert,
} from "lucide-react";

import type { CloudFile } from "../../types/file";
import Modal from "../common/Modal";

interface DeleteFileModalProps {
  file: CloudFile | null;
  onClose: () => void;
  onConfirm: (fileId: string) => void;
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

function DeleteFileModal({
  file,
  onClose,
  onConfirm,
}: DeleteFileModalProps) {
  if (!file) {
    return null;
  }

  const fileId = getFileId(file);
  const fileName = getFileName(file);

  function handleConfirm() {
    if (!fileId) {
      return;
    }

    onConfirm(fileId);
  }

  return (
    <Modal
      isOpen={Boolean(file)}
      title="Delete File?"
      description="This action permanently removes the file from your CloudNest storage."
      size="small"
      onClose={onClose}
    >
      <div className="delete-confirmation">
        <div className="delete-confirmation__icon">
          <TriangleAlert
            size={34}
            aria-hidden="true"
          />
        </div>

        <div>
          <p>
            Are you sure you want to delete{" "}
            <strong title={fileName}>
              {fileName}
            </strong>
            ?
          </p>

          <p>
            This action cannot be undone.
          </p>
        </div>
      </div>

      {!fileId && (
        <p
          className="modal-error"
          role="alert"
        >
          This file cannot be deleted because its file ID is
          missing.
        </p>
      )}

      <footer className="modal__footer">
        <button
          className="secondary-button"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="danger-button"
          type="button"
          disabled={!fileId}
          onClick={handleConfirm}
        >
          <Trash2
            size={18}
            aria-hidden="true"
          />

          Delete Permanently
        </button>
      </footer>
    </Modal>
  );
}

export default DeleteFileModal;