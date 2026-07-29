import {
  FolderPlus,
  Home,
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Toast, {
  type ToastType,
} from "../components/common/Toast";
import DeleteFileModal from "../components/files/DeleteFileModal";
import FileCard from "../components/files/FileCard";
import FileListRow from "../components/files/FileListRow";
import FileToolbar from "../components/files/FileToolbar";
import FolderCard from "../components/files/FolderCard";
import NewFolderModal from "../components/files/NewFolderModal";
import ShareFileModal from "../components/files/ShareFileModal";
import UploadFileModal from "../components/files/UploadFileModal";
import DashboardLayout from "../components/layout/DashboardLayout";

import { useFiles } from "../hooks/useFiles";
import { getCloudNestFileUrl } from "../services/fileService";

import "../styles/files.css";

import type {
  CloudFile,
  CloudFolder,
} from "../types/file";

interface ToastState {
  message: string;
  type: ToastType;
}

function getFileRecord(
  file: CloudFile,
): Record<string, unknown> {
  return file as unknown as Record<string, unknown>;
}

function getFileId(file: CloudFile): string {
  const fileRecord = getFileRecord(file);

  const possibleIds = [
    fileRecord.fileId,
    fileRecord.id,
    fileRecord.file_id,
    fileRecord.key,
    fileRecord.s3Key,
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

function getFileTimestamp(
  file: CloudFile,
): number {
  const fileRecord = getFileRecord(file);

  const dateValue =
    fileRecord.createdAt ??
    fileRecord.uploadedAt ??
    fileRecord.updatedAt ??
    fileRecord.created_at ??
    fileRecord.uploaded_at ??
    fileRecord.updated_at;

  if (
    typeof dateValue !== "string" &&
    typeof dateValue !== "number"
  ) {
    return 0;
  }

  const timestamp = new Date(
    dateValue,
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function getFileSize(
  file: CloudFile,
): number {
  const fileRecord = getFileRecord(file);

  const possibleSizes = [
    fileRecord.sizeInBytes,
    fileRecord.size,
    fileRecord.fileSize,
    fileRecord.file_size,
  ];

  for (const value of possibleSizes) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function getFileCategory(
  file: CloudFile,
): string {
  const fileRecord = getFileRecord(file);

  return typeof fileRecord.category === "string"
    ? fileRecord.category
    : "other";
}

function sanitizeDownloadName(
  fileName: string,
): string {
  const sanitizedName = fileName
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      "_",
    )
    .trim();

  return sanitizedName || "cloudnest-file";
}

function MyFilesPage() {
  const {
    files,
    isLoading,
    isDeleting,
    error,
    refreshFiles,
    deleteFile,
    updateFileLocally,
    clearError,
  } = useFiles();

  const [folders, setFolders] =
    useState<CloudFolder[]>([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [category, setCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">(
      "grid",
    );

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [folderOpen, setFolderOpen] =
    useState(false);

  const [shareFile, setShareFile] =
    useState<CloudFile | null>(null);

  const [
    fileToDelete,
    setFileToDelete,
  ] = useState<CloudFile | null>(
    null,
  );

  const [
    downloadingFileId,
    setDownloadingFileId,
  ] = useState<string | null>(
    null,
  );

  const [toast, setToast] =
    useState<ToastState | null>(
      null,
    );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setToast(null);
      },
      3000,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const visibleFiles = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    const filteredFiles = files.filter(
      (file) => {
        const matchesSearch =
          file.name
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesCategory =
          category === "all" ||
          getFileCategory(file) ===
            category;

        return (
          matchesSearch &&
          matchesCategory
        );
      },
    );

    return [...filteredFiles].sort(
      (
        firstFile,
        secondFile,
      ) => {
        if (sortBy === "name") {
          return firstFile.name.localeCompare(
            secondFile.name,
          );
        }

        if (sortBy === "size") {
          return (
            getFileSize(secondFile) -
            getFileSize(firstFile)
          );
        }

        if (sortBy === "oldest") {
          return (
            getFileTimestamp(
              firstFile,
            ) -
            getFileTimestamp(
              secondFile,
            )
          );
        }

        return (
          getFileTimestamp(
            secondFile,
          ) -
          getFileTimestamp(
            firstFile,
          )
        );
      },
    );
  }, [
    category,
    files,
    searchTerm,
    sortBy,
  ]);

  function showToast(
    message: string,
    type: ToastType = "success",
  ) {
    setToast({
      message,
      type,
    });
  }

  function handleToggleFavorite(
    fileId: string,
  ) {
    const targetFile = files.find(
      (file) =>
        getFileId(file) === fileId,
    );

    if (!targetFile) {
      showToast(
        "The selected file could not be found.",
        "error",
      );
      return;
    }

    updateFileLocally(fileId, {
      isFavorite:
        !targetFile.isFavorite,
    });

    showToast(
      targetFile.isFavorite
        ? `${targetFile.name} removed from favorites.`
        : `${targetFile.name} added to favorites.`,
    );
  }

  async function handleUploadComplete() {
    await refreshFiles();

    showToast(
      "File uploaded successfully.",
    );
  }

  function handleCreateFolder(
    folderName: string,
  ) {
    const trimmedName =
      folderName.trim();

    if (!trimmedName) {
      showToast(
        "Folder name cannot be empty.",
        "error",
      );
      return;
    }

    const newFolder: CloudFolder = {
      id: `folder-${Date.now()}`,
      name: trimmedName,
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
      `Folder "${trimmedName}" created successfully.`,
    );
  }

  async function handleDownload(
    file: CloudFile,
  ): Promise<void> {
    const fileId = getFileId(file);

    if (!fileId) {
      showToast(
        "The file ID is missing.",
        "error",
      );
      return;
    }

    if (downloadingFileId) {
      return;
    }

    setDownloadingFileId(fileId);

    showToast(
      `Preparing ${file.name} for download.`,
      "info",
    );

    try {
      const downloadResponse =
        await getCloudNestFileUrl(fileId);

      const fileResponse =
        await fetch(
          downloadResponse.url,
        );

      if (!fileResponse.ok) {
        throw new Error(
          `File download failed with status ${fileResponse.status}.`,
        );
      }

      const fileBlob =
        await fileResponse.blob();

      const objectUrl =
        URL.createObjectURL(
          fileBlob,
        );

      const downloadLink =
        document.createElement("a");

      downloadLink.href =
        objectUrl;

      downloadLink.download =
        sanitizeDownloadName(
          downloadResponse.fileName ||
            file.name ||
            "cloudnest-file",
        );

      document.body.appendChild(
        downloadLink,
      );

      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(
          objectUrl,
        );
      }, 1000);

      showToast(
        `${file.name} downloaded successfully.`,
      );
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "The file could not be downloaded.";

      console.error(
        "CloudNest download failed:",
        downloadError,
      );

      showToast(
        message,
        "error",
      );
    } finally {
      setDownloadingFileId(
        null,
      );
    }
  }

  async function handleConfirmDelete(
    providedFileId?: string,
  ) {
    if (
      !fileToDelete ||
      isDeleting
    ) {
      return;
    }

    const fileId =
      providedFileId ||
      getFileId(fileToDelete);

    if (!fileId) {
      showToast(
        "The file ID is missing.",
        "error",
      );
      return;
    }

    const fileName =
      fileToDelete.name;

    try {
      await deleteFile(fileId);

      setFileToDelete(null);

      showToast(
        `${fileName} deleted permanently.`,
      );
    } catch (deleteError) {
      console.error(
        "CloudNest delete failed:",
        deleteError,
      );

      showToast(
        "The file could not be deleted.",
        "error",
      );
    }
  }

  async function handleRefresh() {
    clearError();

    try {
      await refreshFiles();

      showToast(
        "Files refreshed successfully.",
      );
    } catch (refreshError) {
      console.error(
        "CloudNest refresh failed:",
        refreshError,
      );

      showToast(
        "Files could not be refreshed.",
        "error",
      );
    }
  }

  return (
    <DashboardLayout>
      <section className="files-page-header">
        <div>
          <div className="files-page-header__breadcrumb">
            <Home size={15} />

            <span>CloudNest</span>

            <span>/</span>

            <strong>
              My Files
            </strong>
          </div>

          <h2>My Files</h2>

          <p>
            Manage, organize and
            securely share your cloud
            files.
          </p>
        </div>

        <div className="files-page-header__actions">
          <button
            className="secondary-button"
            type="button"
            disabled={isLoading}
            onClick={() => {
              void handleRefresh();
            }}
          >
            <RefreshCw
              size={19}
              className={
                isLoading
                  ? "upload-spinner"
                  : undefined
              }
            />

            Refresh
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setFolderOpen(true)
            }
          >
            <FolderPlus size={19} />

            New Folder
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              setUploadOpen(true)
            }
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
        onSearchChange={
          setSearchTerm
        }
        onCategoryChange={
          setCategory
        }
        onSortChange={
          setSortBy
        }
        onViewChange={
          setViewMode
        }
        onUploadClick={() =>
          setUploadOpen(true)
        }
      />

      {error && (
        <div className="files-empty-state">
          <h3>
            Files could not be loaded
          </h3>

          <p>{error}</p>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              void handleRefresh();
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {folders.length > 0 && (
        <section className="files-section">
          <div className="files-section__header">
            <div>
              <h3>Folders</h3>

              <p>
                Organize your files
                into collections
              </p>
            </div>
          </div>

          <div className="folder-grid">
            {folders.map(
              (folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                />
              ),
            )}
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

        {isLoading ? (
          <div className="files-empty-state">
            <div className="upload-spinner" />

            <h3>
              Loading files...
            </h3>

            <p>
              Fetching your
              CloudNest files.
            </p>
          </div>
        ) : visibleFiles.length === 0 ? (
          <div className="files-empty-state">
            <div className="files-empty-state__icon">
              ☁
            </div>

            <h3>
              No files found
            </h3>

            <p>
              Upload a file or change
              your search and filter
              settings.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                setUploadOpen(true)
              }
            >
              <Upload size={18} />

              Upload File
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="cloud-file-grid">
            {visibleFiles.map(
              (file) => {
                const fileId =
                  getFileId(file);

                return (
                  <FileCard
                    key={
                      fileId ||
                      file.name
                    }
                    file={file}
                    onToggleFavorite={
                      handleToggleFavorite
                    }
                    onDownload={(
                      selectedFile:
                        CloudFile,
                    ) => {
                      void handleDownload(
                        selectedFile,
                      );
                    }}
                    onShare={
                      setShareFile
                    }
                    onDelete={
                      setFileToDelete
                    }
                  />
                );
              },
            )}
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

            {visibleFiles.map(
              (file) => {
                const fileId =
                  getFileId(file);

                return (
                  <FileListRow
                    key={
                      fileId ||
                      file.name
                    }
                    file={file}
                    onToggleFavorite={
                      handleToggleFavorite
                    }
                    onDownload={(
                      selectedFile:
                        CloudFile,
                    ) => {
                      void handleDownload(
                        selectedFile,
                      );
                    }}
                    onShare={
                      setShareFile
                    }
                    onDelete={
                      setFileToDelete
                    }
                  />
                );
              },
            )}
          </div>
        )}
      </section>

      <UploadFileModal
        isOpen={uploadOpen}
        onClose={() =>
          setUploadOpen(false)
        }
        onUploadComplete={
          handleUploadComplete
        }
      />

      <NewFolderModal
        isOpen={folderOpen}
        onClose={() =>
          setFolderOpen(false)
        }
        onCreate={
          handleCreateFolder
        }
      />

      <ShareFileModal
        file={shareFile}
        onClose={() =>
          setShareFile(null)
        }
      />

      <DeleteFileModal
        file={fileToDelete}
        onClose={() => {
          if (!isDeleting) {
            setFileToDelete(
              null,
            );
          }
        }}
        onConfirm={
          handleConfirmDelete
        }
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}
    </DashboardLayout>
  );
}

export default MyFilesPage;