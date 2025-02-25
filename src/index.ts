import * as core from "@actions/core";
import { HttpClient } from "@actions/http-client";
import { TypedResponse } from "@actions/http-client/lib/interfaces";
import {
  ColabraComment,
  ColabraErrorResponse,
  ColabraApiError,
  ResourceType,
  ResourceIdInfo,
} from "./types";

const BASE_URL = "https://api.colabra.ai";

type ApiResponse<T> = TypedResponse<T>;

function parseResourceId(resourceId: string): ResourceIdInfo {
  const match = resourceId.match(/^(TSK|PRO)-\d+$/);
  if (!match) {
    throw new Error("resource_id must be in the format TSK-123 or PRO-123");
  }

  const prefix = match[1];
  return {
    type: prefix === "TSK" ? "task" : "project",
    id: resourceId,
  };
}

async function createComment(
  client: HttpClient,
  resourceInfo: ResourceIdInfo,
  bodyText: string
): Promise<ColabraComment> {
  const response: ApiResponse<ColabraComment | ColabraErrorResponse> =
    await client.postJson(`${BASE_URL}/comments`, {
      [`${resourceInfo.type}_id`]: resourceInfo.id,
      body_text: bodyText,
    });

  const { statusCode, result } = response;

  console.log(response, statusCode, result);

  if (statusCode !== 201 && statusCode !== 200) {
    const errorBody = result as ColabraErrorResponse;
    console.log(errorBody);
    throw new ColabraApiError(
      errorBody?.error?.message,
      statusCode,
      errorBody?.error?.code
    );
  }

  return result as ColabraComment;
}

export async function runAction(): Promise<void> {
  try {
    // Get inputs
    const apiKey = core.getInput("api_key", { required: true });
    const workspaceSlug = core.getInput("workspace_slug", { required: true });
    const resourceId = core.getInput("resource_id", { required: true });
    const bodyText = core.getInput("body_text", { required: true });

    // Parse and validate resource ID
    const resourceInfo = parseResourceId(resourceId);

    // Create HTTP client
    const client = new HttpClient("colabra-comment-action", undefined, {
      headers: {
        "Content-Type": "application/json",
        "X-Colabra-Api-Key": apiKey,
      },
    });

    core.debug(`Creating comment on ${resourceInfo.type} ${resourceInfo.id}`);
    const comment = await createComment(client, resourceInfo, bodyText);

    core.debug("Comment created successfully");
    core.setOutput("comment_id", comment.id);
    core.info(
      `Successfully posted comment ${comment.id} to ${resourceInfo.type} ${resourceInfo.id}`
    );
  } catch (error) {
    if (error instanceof ColabraApiError) {
      core.setFailed(
        `API Error (${error.statusCode}): ${error.message}${
          error.errorCode ? ` (${error.errorCode})` : ""
        }`
      );
    } else if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

if (require.main === module) {
  // runAction();
}
