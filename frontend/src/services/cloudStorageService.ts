import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_CLOUDNEST_API_URL?.trim() ||
  "https://hc1h86vvdk.execute-api.eu-north-1.amazonaws.com/prod";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  fileId: string;
  expiresIn: number;
}

export interface UploadProgressOptions {
  onProgress?: (percentage: number) => void;
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

function validateFile(file: File): void {
  if (!(file instanceof File)) {
    throw new Error(
      "A valid file is required.",
    );
  }

  if (!file.name.trim()) {
    throw new Error(
      "The selected file does not have a valid name.",
    );
  }

  if (file.size <= 0) {
    throw new Error(
      "Empty files cannot be uploaded.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "The selected file exceeds the 25 MB upload limit.",
    );
  }
}

async function requestUploadUrl(
  file: File,
): Promise<UploadUrlResponse> {
  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/upload-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType:
          file.type ||
          "application/octet-stream",
        fileSize: file.size,
      }),
    },
  );

  if (!response.ok) {
    const message =
      await parseErrorResponse(
        response,
        `Could not create an upload URL (${response.status}).`,
      );

    throw new Error(message);
  }

  const data =
    (await response.json()) as Partial<UploadUrlResponse>;

  if (
    typeof data.uploadUrl !== "string" ||
    !data.uploadUrl.trim()
  ) {
    throw new Error(
      "The upload service did not return a valid S3 upload URL.",
    );
  }

  if (
    typeof data.s3Key !== "string" ||
    !data.s3Key.trim()
  ) {
    throw new Error(
      "The upload service did not return a valid S3 object key.",
    );
  }

  if (
    typeof data.fileId !== "string" ||
    !data.fileId.trim()
  ) {
    throw new Error(
      "The upload service did not return a valid file ID.",
    );
  }

  return {
    uploadUrl: data.uploadUrl,
    s3Key: data.s3Key,
    fileId: data.fileId,
    expiresIn:
      typeof data.expiresIn === "number"
        ? data.expiresIn
        : 900,
  };
}

function uploadFileToS3(
  file: File,
  uploadUrl: string,
  options: UploadProgressOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request =
      new XMLHttpRequest();

    request.open(
      "PUT",
      uploadUrl,
      true,
    );

    request.setRequestHeader(
      "Content-Type",
      file.type ||
        "application/octet-stream",
    );

    request.upload.addEventListener(
      "progress",
      (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const percentage = Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (event.loaded /
                event.total) *
                100,
            ),
          ),
        );

        options.onProgress?.(
          percentage,
        );
      },
    );

    request.addEventListener(
      "load",
      () => {
        if (
          request.status >= 200 &&
          request.status < 300
        ) {
          options.onProgress?.(100);
          resolve();
          return;
        }

        reject(
          new Error(
            `S3 upload failed with status ${request.status}.`,
          ),
        );
      },
    );

    request.addEventListener(
      "error",
      () => {
        reject(
          new Error(
            "The file could not be uploaded. Check your network connection and S3 CORS configuration.",
          ),
        );
      },
    );

    request.addEventListener(
      "timeout",
      () => {
        reject(
          new Error(
            "The upload timed out. Please try again.",
          ),
        );
      },
    );

    request.addEventListener(
      "abort",
      () => {
        reject(
          new Error(
            "The upload was cancelled.",
          ),
        );
      },
    );

    request.timeout = 120000;

    options.onProgress?.(0);

    request.send(file);
  });
}

export async function uploadCloudNestFile(
  file: File,
  options: UploadProgressOptions = {},
): Promise<UploadUrlResponse> {
  validateFile(file);

  const uploadDetails =
    await requestUploadUrl(file);

  await uploadFileToS3(
    file,
    uploadDetails.uploadUrl,
    options,
  );

  return uploadDetails;
}