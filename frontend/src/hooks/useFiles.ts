import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  deleteCloudNestFile,
  listCloudNestFiles,
} from "../services/fileService";

import type { CloudFile } from "../types/file";

interface UseFilesResult {
  files: CloudFile[];
  isLoading: boolean;
  isDeleting: boolean;
  error: string;
  refreshFiles: () => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateFileLocally: (
    fileId: string,
    updates: Partial<CloudFile>,
  ) => void;
  removeFileLocally: (fileId: string) => void;
  clearError: () => void;
}

function getCloudFileId(file: CloudFile): string {
  const fileRecord =
    file as unknown as Record<string, unknown>;

  if (typeof fileRecord.fileId === "string") {
    return fileRecord.fileId;
  }

  if (typeof fileRecord.id === "string") {
    return fileRecord.id;
  }

  return "";
}

export function useFiles(): UseFilesResult {
  const [files, setFiles] = useState<CloudFile[]>(
    [],
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState("");

  const refreshFiles = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const cloudFiles =
        await listCloudNestFiles();

      setFiles(cloudFiles);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Files could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFileLocally = useCallback(
    (
      fileId: string,
      updates: Partial<CloudFile>,
    ) => {
      setFiles((currentFiles) =>
        currentFiles.map((file) =>
          getCloudFileId(file) === fileId
            ? {
                ...file,
                ...updates,
              }
            : file,
        ),
      );
    },
    [],
  );

  const removeFileLocally = useCallback(
    (fileId: string) => {
      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) =>
            getCloudFileId(file) !== fileId,
        ),
      );
    },
    [],
  );

  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!fileId || isDeleting) {
        return;
      }

      setIsDeleting(true);
      setError("");

      try {
        await deleteCloudNestFile(fileId);
        removeFileLocally(fileId);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "The file could not be deleted.";

        setError(message);
        throw requestError;
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting, removeFileLocally],
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    void refreshFiles();
  }, [refreshFiles]);

  return {
    files,
    isLoading,
    isDeleting,
    error,
    refreshFiles,
    deleteFile,
    updateFileLocally,
    removeFileLocally,
    clearError,
  };
}

export default useFiles;