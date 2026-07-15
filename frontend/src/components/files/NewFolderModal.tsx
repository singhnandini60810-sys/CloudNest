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
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFolderName("");
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = folderName.trim();

    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);
    setFolderName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Create new folder"
      description="Organize related files inside a dedicated folder."
      size="small"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <label className="modal-field">
          <span>Folder name</span>

          <div className="modal-input-with-icon">
            <FolderPlus size={19} />

            <input
              type="text"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Example: Summer Training"
              maxLength={60}
              autoFocus
            />
          </div>
        </label>

        <footer className="modal__footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-button"
            type="submit"
            disabled={!folderName.trim()}
          >
            <FolderPlus size={18} />
            Create Folder
          </button>
        </footer>
      </form>
    </Modal>
  );
}

export default NewFolderModal;