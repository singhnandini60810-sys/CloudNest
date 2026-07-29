import { Folder, MoreHorizontal } from "lucide-react";
import type { CloudFolder } from "../../types/file";

interface FolderCardProps {
  folder: CloudFolder;
}

function FolderCard({ folder }: FolderCardProps) {
  const fileCount = folder.fileCount ?? 0;

  return (
    <article className="folder-card">
      <div className="folder-card__top">
        <div className="folder-card__icon">
          <Folder
            size={30}
            fill="currentColor"
          />
        </div>

        <button
          type="button"
          disabled
          aria-label="Folder actions will be available in a future update"
          title="Coming soon"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <h3 title={folder.name}>
        {folder.name}
      </h3>

      <div className="folder-card__details">
        <span>
          {fileCount}{" "}
          {fileCount === 1 ? "file" : "files"}
        </span>

        <span>{folder.updatedAt}</span>
      </div>
    </article>
  );
}

export default FolderCard;