import { FolderPlus, Home, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";

import FileToolbar from "../components/files/FileToolbar";
import FolderCard from "../components/files/FolderCard";
import FileCard from "../components/files/FileCard";
import FileListRow from "../components/files/FileListRow";

import UploadFileModal from "../components/files/UploadFileModal";
import PreviewFileModal from "../components/files/PreviewFileModal";
import ShareFileModal from "../components/files/ShareFileModal";
import DeleteFileModal from "../components/files/DeleteFileModal";
import NewFolderModal from "../components/files/NewFolderModal";
import "../styles/files.css";

import Toast, {
  type ToastType,
} from "../components/common/Toast";

import type {
  CloudFile,
  CloudFolder,
} from "../types/file";


const initialFiles: CloudFile[] = [
  {
    id: "1",
    name: "Summer Training Report.pdf",
    size: "3.8 MB",
    category: "document",
    extension: "PDF",
    uploadedAt: "Today",
    isFavorite: true,
  },

  {
    id: "2",
    name: "CloudNest UI.png",
    size: "2.2 MB",
    category: "image",
    extension: "PNG",
    uploadedAt: "Yesterday",
    isFavorite: false,
  },

  {
    id: "3",
    name: "Presentation.pptx",
    size: "8.6 MB",
    category: "document",
    extension: "PPTX",
    uploadedAt: "Yesterday",
    isFavorite: false,
  },

  {
    id: "4",
    name: "Architecture.mp4",
    size: "45 MB",
    category: "video",
    extension: "MP4",
    uploadedAt: "2 days ago",
    isFavorite: true,
  },

  {
    id: "5",
    name: "Assets.zip",
    size: "12 MB",
    category: "archive",
    extension: "ZIP",
    uploadedAt: "Last week",
    isFavorite: false,
  },

  {
    id: "6",
    name: "Meeting.mp3",
    size: "5 MB",
    category: "audio",
    extension: "MP3",
    uploadedAt: "Last week",
    isFavorite: false,
  },
];

const initialFolders: CloudFolder[] = [
  {
    id: "f1",
    name: "Summer Training",
    fileCount: 15,
    updatedAt: "Today",
  },

  {
    id: "f2",
    name: "Certificates",
    fileCount: 8,
    updatedAt: "Yesterday",
  },

  {
    id: "f3",
    name: "Screenshots",
    fileCount: 28,
    updatedAt: "2 days ago",
  },

  {
    id: "f4",
    name: "Project Docs",
    fileCount: 11,
    updatedAt: "Last week",
  },
];

interface ToastState {
  message: string;
  type: ToastType;
}

function getCategory(
  filename: string,
): CloudFile["category"] {
  const ext =
    filename.split(".").pop()?.toLowerCase() ?? "";

  if (
    [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "txt",
      "xls",
      "xlsx",
    ].includes(ext)
  ) {
    return "document";
  }

  if (
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "svg",
      "webp",
    ].includes(ext)
  ) {
    return "image";
  }

  if (
    [
      "mp4",
      "avi",
      "mov",
      "mkv",
    ].includes(ext)
  ) {
    return "video";
  }

  if (
    [
      "mp3",
      "wav",
      "aac",
      "ogg",
    ].includes(ext)
  ) {
    return "audio";
  }

  if (
    [
      "zip",
      "rar",
      "7z",
      "tar",
    ].includes(ext)
  ) {
    return "archive";
  }

  return "other";
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}

function MyFilesPage() {
    const [files, setFiles] = useState(initialFiles);
  const [folders, setFolders] = useState(initialFolders);

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [folderOpen, setFolderOpen] =
    useState(false);

  const [previewFile, setPreviewFile] =
    useState<CloudFile | null>(null);

  const [shareFile, setShareFile] =
    useState<CloudFile | null>(null);

  const [deleteFile, setDeleteFile] =
    useState<CloudFile | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);
      useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const visibleFiles = useMemo(() => {
    const filteredFiles = files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        category === "all" ||
        file.category === category;

      return matchesSearch && matchesCategory;
    });

    return [...filteredFiles].sort(
      (firstFile, secondFile) => {
        if (sortBy === "name") {
          return firstFile.name.localeCompare(
            secondFile.name,
          );
        }

        if (sortBy === "size") {
          const firstSize = parseFloat(
            firstFile.size,
          );

          const secondSize = parseFloat(
            secondFile.size,
          );

          return secondSize - firstSize;
        }

        if (sortBy === "oldest") {
          return firstFile.id.localeCompare(
            secondFile.id,
          );
        }

        return secondFile.id.localeCompare(
          firstFile.id,
        );
      },
    );
  }, [
    category,
    files,
    searchTerm,
    sortBy,
  ]);

  const showToast = (
    message: string,
    type: ToastType = "success",
  ) => {
    setToast({
      message,
      type,
    });
  };

  const handleToggleFavorite = (
    fileId: string,
  ) => {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              isFavorite:
                !file.isFavorite,
            }
          : file,
      ),
    );
  };

  const handleUpload = (
    uploadedFiles: File[],
  ) => {
    const newFiles: CloudFile[] =
      uploadedFiles.map(
        (file, index) => {
          const extension =
            file.name
              .split(".")
              .pop()
              ?.toUpperCase() ??
            "FILE";

          return {
            id: `uploaded-${Date.now()}-${index}`,
            name: file.name,
            size: formatSize(
              file.size,
            ),
            category: getCategory(
              file.name,
            ),
            extension,
            uploadedAt: "Just now",
            isFavorite: false,
          };
        },
      );

    setFiles((currentFiles) => [
      ...newFiles,
      ...currentFiles,
    ]);

    showToast(
      `${uploadedFiles.length} ${
        uploadedFiles.length === 1
          ? "file"
          : "files"
      } uploaded successfully.`,
    );
  };

  const handleCreateFolder = (
    folderName: string,
  ) => {
    const newFolder: CloudFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      fileCount: 0,
      updatedAt:
        "Created just now",
    };

    setFolders(
      (currentFolders) => [
        newFolder,
        ...currentFolders,
      ],
    );

    showToast(
      `Folder "${folderName}" created successfully.`,
    );
  };

  const handleDownload = (
    file: CloudFile,
  ) => {
    showToast(
      `Preparing ${file.name} for download.`,
      "info",
    );
  };

  const handleOpenShare = (
    file: CloudFile,
  ) => {
    setPreviewFile(null);
    setShareFile(file);
  };

  const handleConfirmDelete = (
    fileId: string,
  ) => {
    const targetFile =
      files.find(
        (file) =>
          file.id === fileId,
      );

    setFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          file.id !== fileId,
      ),
    );

    setDeleteFile(null);

    showToast(
      targetFile
        ? `${targetFile.name} moved to Trash.`
        : "File moved to Trash.",
    );
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

          <p>
            Manage, organize and securely share your cloud files.
          </p>
        </div>

        <div className="files-page-header__actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setFolderOpen(true)}
          >
            <FolderPlus size={19} />
            New Folder
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={() => setUploadOpen(true)}
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
        onUploadClick={() => setUploadOpen(true)}
      />

      <section className="files-section">
        <div className="files-section__header">
          <div>
            <h3>Folders</h3>
            <p>
              Organize your files into collections
            </p>
          </div>

          <button
            className="text-button"
            type="button"
          >
            View all folders
          </button>
        </div>

        <div className="folder-grid">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
            />
          ))}
        </div>
      </section>

      <section className="files-section">
        <div className="files-section__header">
          <div>
            <h3>All Files</h3>

            <p>
              {visibleFiles.length}{" "}
              {visibleFiles.length === 1
                ? "file"
                : "files"}{" "}
              found
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
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />

      <NewFolderModal
        isOpen={folderOpen}
        onClose={() => setFolderOpen(false)}
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
  