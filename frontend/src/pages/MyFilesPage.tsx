import { FolderPlus, Home, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Toast, { type ToastType } from "../components/common/Toast";
import DeleteFileModal from "../components/files/DeleteFileModal";
import FileCard from "../components/files/FileCard";
import FileListRow from "../components/files/FileListRow";
import FileToolbar from "../components/files/FileToolbar";
import FolderCard from "../components/files/FolderCard";
import NewFolderModal from "../components/files/NewFolderModal";
import PreviewFileModal from "../components/files/PreviewFileModal";
import ShareFileModal from "../components/files/ShareFileModal";
import UploadFileModal from "../components/files/UploadFileModal";
import DashboardLayout from "../components/layout/DashboardLayout";
import type { CloudFile, CloudFolder } from "../types/file";

const initialFiles: CloudFile[] = [
  {
    id: "file-1",
    name: "Summer Training Report.pdf",
    size: "3.8 MB",
    category: "document",
    extension: "PDF",
    uploadedAt: "Today, 10:30 AM",
    isFavorite: true,
  },
  {
    id: "file-2",
    name: "CloudNest Architecture.png",
    size: "2.1 MB",
    category: "image",
    extension: "PNG",
    uploadedAt: "Today, 9:15 AM",
    isFavorite: false,
  },
  {
    id: "file-3",
    name: "Project Presentation.pptx",
    size: "8.4 MB",
    category: "document",
    extension: "PPTX",
    uploadedAt: "Yesterday",
    isFavorite: false,
  },
  {
    id: "file-4",
    name: "Demo Recording.mp4",
    size: "42.7 MB",
    category: "video",
    extension: "MP4",
    uploadedAt: "July 13, 2026",
    isFavorite: true,
  },
  {
    id: "file-5",
    name: "UI Assets.zip",
    size: "18.6 MB",
    category: "archive",
    extension: "ZIP",
    uploadedAt: "July 12, 2026",
    isFavorite: false,
  },
  {
    id: "file-6",
    name: "Project Notes.txt",
    size: "84 KB",
    category: "document",
    extension: "TXT",
    uploadedAt: "July 11, 2026",
    isFavorite: false,
  },
  {
    id: "file-7",
    name: "Presentation Audio.mp3",
    size: "6.2 MB",
    category: "audio",
    extension: "MP3",
    uploadedAt: "July 10, 2026",
    isFavorite: false,
  },
  {
    id: "file-8",
    name: "AWS Certificate.jpg",
    size: "1.4 MB",
    category: "image",
    extension: "JPG",
    uploadedAt: "July 8, 2026",
    isFavorite: true,
  },
];

const initialFolders: CloudFolder[] = [
  {
    id: "folder-1",
    name: "Summer Training",
    fileCount: 12,
    updatedAt: "Updated today",
  },
  {
    id: "folder-2",
    name: "Project Documents",
    fileCount: 8,
    updatedAt: "Updated yesterday",
  },
  {
    id: "folder-3",
    name: "Screenshots",
    fileCount: 24,
    updatedAt: "Updated July 12",
  },
  {
    id: "folder-4",
    name: "Certificates",
    fileCount: 6,
    updatedAt: "Updated July 8",
  },
];

interface ToastState {
  message: string;
  type: ToastType;
}

function getFileCategory(fileName: string): CloudFile["category"] {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"].includes(extension)) {
    return "document";
  }

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) {
    return "image";
  }

  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
    return "video";
  }

  if (["mp3", "wav", "aac", "ogg"].includes(extension)) {
    return "audio";
  }

  if (["zip", "rar", "7z", "tar"].includes(extension)) {
    return "archive";
  }

  return "other";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MyFilesPage() {
  const [files, setFiles] = useState(initialFiles);
  const [folders, setFolders] = useState(initialFolders);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);
  const [shareFile, setShareFile] = useState<CloudFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<CloudFile | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleFiles = useMemo(() => {
    const filteredFiles = files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        category === "all" || file.category === category;

      return matchesSearch && matchesCategory;
    });

    return [...filteredFiles].sort((firstFile, secondFile) => {
      if (sortBy === "name") {
        return firstFile.name.localeCompare(secondFile.name);
      }

      if (sortBy === "size") {
        return secondFile.size.localeCompare(firstFile.size);
      }

      if (sortBy === "oldest") {
        return firstFile.id.localeCompare(secondFile.id);
      }

      return secondFile.id.localeCompare(firstFile.id);
    });
  }, [category, files, searchTerm, sortBy]);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId
          ? { ...file, isFavorite: !file.isFavorite }
          : file,
      ),
    );
  };

  const handleUpload = (uploadedFiles: File[]) => {
    const newFiles: CloudFile[] = uploadedFiles.map((file, index) => {
      const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";

      return {
        id: `uploaded-${Date.now()}-${index}`,
        name: file.name,
        size: formatFileSize(file.size),
        category: getFileCategory(file.name),
        extension,
        uploadedAt: "Just now",
        isFavorite: false,
      };
    });

    setFiles((currentFiles) => [...newFiles, ...currentFiles]);

    showToast(
      `${uploadedFiles.length} ${
        uploadedFiles.length === 1 ? "file" : "files"
      } uploaded successfully.`,
    );
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: CloudFolder = {
      id: `folder-${Date.now()}`,
      name,
      fileCount: 0,
      updatedAt: "Created just now",
    };

    setFolders((currentFolders) => [newFolder, ...currentFolders]);
    showToast(`Folder "${name}" created successfully.`);
  };

  const handleDownload = (file: CloudFile) => {
    showToast(`Preparing ${file.name} for download.`, "info");
  };

  const handleConfirmDelete = (fileId: string) => {
    const targetFile = files.find((file) => file.id === fileId);

    setFiles((currentFiles) =>
      currentFiles.filter((file) => file.id !== fileId),
    );

    setDeleteFile(null);

    showToast(
      targetFile
        ? `${targetFile.name} moved to Trash.`
        : "File moved to Trash.",
    );
  };

  const handleOpenShare = (file: CloudFile) => {
    setPreviewFile(null);
    setShareFile(file);
  };

  return (
    <DashboardLayout>
      <section className="files-page-header">
        <div>
          <div className="files-page-header__breadcrumb">
            <Home size={15} />
            <span>CloudNest</span>
            <span>/</span>
            <strong>My Files</strong>
          </div>

          <h2>My Files</h2>

          <p>Manage, organize and securely share your cloud files.</p>
        </div>

        <div className="files-page-header__actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setIsFolderOpen(true)}
          >
            <FolderPlus size={19} />
            New Folder
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload size={19} />
            Upload Files
          </button>
        </div>
      </section>

      <FileToolbar
        searchTerm={searchTerm}
        category={category}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategory}
        onSortChange={setSortBy}
        onViewChange={setViewMode}
      />

      <section className="files-section">
        <div className="files-section__header">
          <div>
            <h3>Folders</h3>
            <p>Organize your files into collections</p>
          </div>

          <button className="text-button" type="button">
            View all folders
          </button>
        </div>

        <div className="folder-grid">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      </section>

      <section className="files-section">
        <div className="files-section__header">
          <div>
            <h3>All Files</h3>
            <p>
              {visibleFiles.length}{" "}
              {visibleFiles.length === 1 ? "file" : "files"} found
            </p>
          </div>
        </div>

        {visibleFiles.length === 0 ? (
          <div className="files-empty-state">
            <div className="files-empty-state__icon">☁️</div>
            <h3>No files found</h3>
            <p>Try changing your search or file-type filter.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="cloud-file-grid">
            {visibleFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onToggleFavorite={handleToggleFavorite}
                onPreview={setPreviewFile}
                onDownload={handleDownload}
                onShare={setShareFile}
                onDelete={setDeleteFile}
              />
            ))}
          </div>
        ) : (
          <div className="file-list">
            <div className="file-list__header">
              <span>File</span>
              <span>Type</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span>Actions</span>
            </div>

            {visibleFiles.map((file) => (
              <FileListRow
                key={file.id}
                file={file}
                onToggleFavorite={handleToggleFavorite}
                onPreview={setPreviewFile}
                onDownload={handleDownload}
                onShare={setShareFile}
                onDelete={setDeleteFile}
              />
            ))}
          </div>
        )}
      </section>

      <UploadFileModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      <NewFolderModal
        isOpen={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <PreviewFileModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
        onShare={handleOpenShare}
      />

      <ShareFileModal
        file={shareFile}
        onClose={() => setShareFile(null)}
      />

      <DeleteFileModal
        file={deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default MyFilesPage;