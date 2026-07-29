import { fetchAuthSession } from "aws-amplify/auth";

import type { CloudFile } from "../types/file";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://hc1h86vvdk.execute-api.eu-north-1.amazonaws.com/prod";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface ListFilesResponse {
  files?: CloudFile[];
  items?: CloudFile[];
}

interface FileUrlResponse {
  fileId: string;
  fileName: string;
  contentType: string;
  mode: "preview" | "download";
  url: string;
  expiresIn: number;
}

async function getAccessToken(): Promise<string> {
  const session = await fetchAuthSession();
  const accessToken =
    session.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error(
      "Your session has expired. Please sign in again.",
    );
  }

  return accessToken;
}

async function parseErrorResponse(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data =
      (await response.json()) as ApiErrorResponse;

    return (
      data.message ||
      data.error ||
      fallbackMessage
    );
  } catch {
    return fallbackMessage;
  }
}

export async function listCloudNestFiles(): Promise<
  CloudFile[]
> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/files`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await parseErrorResponse(
      response,
      "Files could not be loaded.",
    );

    throw new Error(message);
  }

  const data =
    (await response.json()) as
      | CloudFile[]
      | ListFilesResponse;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.files)) {
    return data.files;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

export async function deleteCloudNestFile(
  fileId: string,
): Promise<void> {
  if (!fileId.trim()) {
    throw new Error("File ID is required.");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/files/${encodeURIComponent(
      fileId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await parseErrorResponse(
      response,
      "The file could not be deleted.",
    );

    throw new Error(message);
  }
}

export async function getCloudNestFileUrl(
  fileId: string,
  mode: "preview" | "download" = "preview",
): Promise<FileUrlResponse> {
  if (!fileId.trim()) {
    throw new Error("File ID is required.");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/files/${encodeURIComponent(
      fileId,
    )}?mode=${mode}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await parseErrorResponse(
      response,
      mode === "preview"
        ? "The file preview could not be opened."
        : "The file could not be downloaded.",
    );

    throw new Error(message);
  }

  const data =
    (await response.json()) as FileUrlResponse;

  if (!data.url) {
    throw new Error(
      "The file URL was not returned by the server.",
    );
  }

  return data;
}