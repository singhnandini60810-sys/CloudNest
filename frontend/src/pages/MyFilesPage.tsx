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

import Toast, {
  type ToastType,
} from "../components/common/Toast";

import type {
  CloudFile,
  CloudFolder,
} from "../types/file";

import "../styles/files.css";

const initialFiles: CloudFile[] = [];
const initialFolders: CloudFolder[] = [];

interface ToastState {
  message: string;
  type: ToastType;
}

function MyFilesPage() {
  const [files, setFiles] =
    useState<CloudFile[]>(initialFiles);

  const [folders, setFolders] =
    useState<CloudFolder[]>(initialFolders);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

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
              isFavorite: !file.isFavorite,
            }
          : file,
      ),
    );
  };

  const handleCreateFolder = (
    folderName: string,
  ) => {
    const newFolder: CloudFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      fileCount: 0,
      updatedAt: "Created just now",
    };

    setFolders((currentFolders) => [
      newFolder,
      ...currentFolders,
    ]);

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
    const targetFile = files.find(
      (file) => file.id === fileId,
    );

    setFiles((currentFiles) =>
      currentFiles.filter(
        (file) => file.id !== fileId,
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
            Manage, organize and securely share your
            cloud files.
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

      {folders.length > 0 && (
        <section className="files-section">
          <div className="files-section__header">
            <div>
              <h3>Folders</h3>

              <p>
                Organize your files into collections
              </p>
            </div>
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
      )}

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
            <div className="files-empty-state__icon">
              ☁️
            </div>

            <h3>No files found</h3>

            <p>
              Upload your first file to start using
              CloudNest.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setUploadOpen(true)}
            >
              <Upload size={18} />
              Upload File
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="cloud-file-grid">
            {visibleFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onToggleFavorite={
                  handleToggleFavorite
                }
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
                onToggleFavorite={
                  handleToggleFavorite
                }
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