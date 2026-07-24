import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const documentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({}),
);

const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "http://localhost:5173";

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
    body: JSON.stringify(body),
  };
}

function decodeNextToken(token) {
  if (!token) {
    return undefined;
  }

  try {
    return JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    );
  } catch {
    throw new Error("Invalid pagination token.");
  }
}

function encodeNextToken(key) {
  if (!key) {
    return null;
  }

  return Buffer.from(JSON.stringify(key)).toString("base64url");
}

export const handler = async (event) => {
  try {
    const claims =
      event.requestContext?.authorizer?.jwt?.claims;

    const userId = claims?.sub;

    if (!userId) {
      return response(401, {
        message: "You must be signed in.",
      });
    }

    const queryParameters =
      event.queryStringParameters || {};

    const requestedLimit = Number(queryParameters.limit || 50);
    const limit = Math.min(
      Math.max(requestedLimit, 1),
      100,
    );

    const result = await documentClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
          "#userId": "userId",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        Limit: limit,
        ExclusiveStartKey: decodeNextToken(
          queryParameters.nextToken,
        ),
      }),
    );

    const files = (result.Items || []).sort((first, second) => {
      const firstDate =
        first.createdAt || first.uploadedAt || "";
      const secondDate =
        second.createdAt || second.uploadedAt || "";

      return secondDate.localeCompare(firstDate);
    });

    return response(200, {
      files,
      nextToken: encodeNextToken(
        result.LastEvaluatedKey,
      ),
    });
  } catch (error) {
    console.error("List files error:", error);

    return response(500, {
      message:
        error instanceof Error
          ? error.message
          : "Files could not be loaded.",
    });
  }
};
