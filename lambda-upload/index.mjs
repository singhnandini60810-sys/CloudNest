import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const s3Client = new S3Client({});
const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({}),
);

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const allowedContentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function sanitizeFileName(fileName) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 150);
}

function getUserId(event) {
  return (
    event.requestContext?.authorizer?.jwt?.claims?.sub ??
    event.requestContext?.authorizer?.claims?.sub ??
    null
  );
}

export const handler = async (event) => {
  try {
    if (event.requestContext?.http?.method === "OPTIONS") {
      return createResponse(200, {
        message: "CORS request accepted.",
      });
    }

    const userId = getUserId(event);

    if (!userId) {
      return createResponse(401, {
        message: "You must be signed in.",
      });
    }

    if (!BUCKET_NAME || !TABLE_NAME) {
      console.error("Missing Lambda environment variables.");

      return createResponse(500, {
        message: "Server configuration is incomplete.",
      });
    }

    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body;

    const fileName = sanitizeFileName(body?.fileName ?? "");
    const contentType = body?.contentType ?? "";
    const fileSize = Number(body?.fileSize);
    const parentFolderId = body?.parentFolderId ?? "ROOT";

    if (!fileName) {
      return createResponse(400, {
        message: "A valid file name is required.",
      });
    }

    if (!allowedContentTypes.has(contentType)) {
      return createResponse(400, {
        message: "This file type is not supported.",
      });
    }

    if (
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_FILE_SIZE
    ) {
      return createResponse(400, {
        message: "The file must be smaller than 25 MB.",
      });
    }

    const fileId = randomUUID();
    const createdAt = new Date().toISOString();

    const s3Key =
      `users/${userId}/files/${fileId}/${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
      Metadata: {
        userid: userId,
        fileid: fileId,
      },
    });

    const uploadUrl = await getSignedUrl(
      s3Client,
      uploadCommand,
      {
        expiresIn: 300,
      },
    );

    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          userId,
          fileId,
          itemType: "FILE",
          name: fileName,
          originalName: body.fileName,
          s3Key,
          bucketName: BUCKET_NAME,
          contentType,
          size: fileSize,
          status: "PENDING_UPLOAD",
          isFavorite: false,
          parentFolderId,
          createdAt,
          updatedAt: createdAt,
        },
        ConditionExpression:
          "attribute_not_exists(userId) AND attribute_not_exists(fileId)",
      }),
    );

    return createResponse(200, {
      fileId,
      uploadUrl,
      s3Key,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Generate upload URL error:", error);

    return createResponse(500, {
      message: "Unable to prepare the file upload.",
    });
  }
};