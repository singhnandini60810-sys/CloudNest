import {
  Filter,
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface FileToolbarProps {
  searchTerm: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onViewChange: (value: "grid" | "list") => void;
}

function FileToolbar({
  searchTerm,
  category,
  sortBy,
  viewMode,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onViewChange,
}: FileToolbarProps) {
  return (
    <section className="file-toolbar">
      <label className="file-toolbar__search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Search your files..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <div className="file-toolbar__controls">
        <label className="file-toolbar__select">
          <Filter size={17} />

          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="Filter files by category"
          >
            <option value="all">All types</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="archive">Archives</option>
          </select>
        </label>

        <label className="file-toolbar__select">
          <SlidersHorizontal size={17} />

          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label="Sort files"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </label>

        <div className="file-toolbar__view">
          <button
            type="button"
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 size={19} />
          </button>

          <button
            type="button"
            className={viewMode === "list" ? "active" : ""}
            onClick={() => onViewChange("list")}
            aria-label="List view"
          >
            <List size={20} />
          </button>
        </div>

        <button className="primary-button" type="button">
          <Plus size={19} />
          Upload
        </button>
      </div>
    </section>
  );
}

export default FileToolbar;