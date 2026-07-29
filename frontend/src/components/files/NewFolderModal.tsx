import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../common/Modal";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function NewFolderModal({
  isOpen,
  onClose,
  onCreate,
}: NewFolderModalProps) {
  const [folderName, setFolderName] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      setFolderName("");
    }
  }, [isOpen]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName =
      folderName.trim();

    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);

    setFolderName("");

    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Create New Folder"
      description="Organize related files inside a folder."
      size="small"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="modal-field">
          <span>Folder Name</span>

          <div className="modal-input-with-icon">
            <FolderPlus
              size={19}
              aria-hidden="true"
            />

            <input
              type="text"
              value={folderName}
              onChange={(event) =>
                setFolderName(
                  event.target.value,
                )
              }
              placeholder="Example: Summer Training"
              maxLength={60}
              autoFocus
              autoComplete="off"
              aria-label="Folder name"
            />
          </div>
        </label>

        <footer className="modal__footer">
          <button
            className="secondary-button"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            type="submit"
            disabled={
              folderName.trim().length ===
              0
            }
          >
            <FolderPlus
              size={18}
              aria-hidden="true"
            />

            Create Folder
          </button>
        </footer>
      </form>
    </Modal>
  );
}

export default NewFolderModal;