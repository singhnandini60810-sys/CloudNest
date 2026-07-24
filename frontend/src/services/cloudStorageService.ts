import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL =
  import.meta.env.VITE_CLOUDNEST_API_URL ??
  "https://hc1h86vvdk.execute-api.eu-north-1.amazonaws.com/prod";

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  fileId?: string;
}

interface UploadProgressOptions {
  onProgress?: (percentage: number) => void;
}

async function getIdToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return token;
}

async function requestUploadUrl(file: File): Promise<UploadUrlResponse> {
  const token = await getIdToken();

  const response = await fetch(`${API_BASE_URL}/upload-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
    }),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      responseBody?.message ??
        `Could not create an upload URL (${response.status}).`,
    );
  }

  if (!responseBody?.uploadUrl || !responseBody?.key) {
    throw new Error("The upload service returned an invalid response.");
  }

  return responseBody as UploadUrlResponse;
}

function uploadFileToS3(
  file: File,
  uploadUrl: string,
  options: UploadProgressOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", uploadUrl);

    request.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const percentage = Math.round((event.loaded / event.total) * 100);
      options.onProgress?.(percentage);
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        options.onProgress?.(100);
        resolve();
        return;
      }

      reject(
        new Error(`S3 upload failed with status ${request.status}.`),
      );
    });

    request.addEventListener("error", () => {
      reject(
        new Error(
          "The file could not be uploaded. Check your network and S3 CORS settings.",
        ),
      );
    });

    request.addEventListener("abort", () => {
      reject(new Error("The upload was cancelled."));
    });

    request.send(file);
  });
}

export async function uploadCloudNestFile(
  file: File,
  options: UploadProgressOptions = {},
): Promise<UploadUrlResponse> {
  const uploadDetails = await requestUploadUrl(file);

  await uploadFileToS3(file, uploadDetails.uploadUrl, options);

  return uploadDetails;
}