import { Folder, MoreHorizontal } from "lucide-react";
import type { CloudFolder } from "../../types/file";

interface FolderCardProps {
  folder: CloudFolder;
}

function FolderCard({ folder }: FolderCardProps) {
  return (
    <article className="folder-card">
      <div className="folder-card__top">
        <div className="folder-card__icon">
          <Folder size={30} fill="currentColor" />
        </div>

        <button
          type="button"
          aria-label={`More options for ${folder.name}`}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <h3>{folder.name}</h3>

      <div className="folder-card__details">
        <span>{folder.fileCount} files</span>
        <span>{folder.updatedAt}</span>
      </div>
    </article>
  );
}

export default FolderCard;