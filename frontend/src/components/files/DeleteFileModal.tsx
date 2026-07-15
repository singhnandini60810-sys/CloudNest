import { Trash2, TriangleAlert } from "lucide-react";
import type { CloudFile } from "../../types/file";
import Modal from "../common/Modal";

interface DeleteFileModalProps {
  file: CloudFile | null;
  onClose: () => void;
  onConfirm: (fileId: string) => void;
}

function DeleteFileModal({
  file,
  onClose,
  onConfirm,
}: DeleteFileModalProps) {
  if (!file) {
    return null;
  }

  return (
    <Modal
      isOpen={Boolean(file)}
      title="Move file to trash?"
      description="You can restore this file later from the Trash page."
      size="small"
      onClose={onClose}
    >
      <div className="delete-confirmation">
        <div className="delete-confirmation__icon">
          <TriangleAlert size={34} />
        </div>

        <p>
          <strong>{file.name}</strong> will be moved to your trash.
        </p>
      </div>

      <footer className="modal__footer">
        <button className="secondary-button" type="button" onClick={onClose}>
          Cancel
        </button>

        <button
          className="danger-button"
          type="button"
          onClick={() => onConfirm(file.id)}
        >
          <Trash2 size={18} />
          Move to Trash
        </button>
      </footer>
    </Modal>
  );
}

export default DeleteFileModal;