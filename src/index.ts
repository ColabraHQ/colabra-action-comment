import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { TypedResponse } from '@actions/http-client/lib/interfaces'
import { ColabraComment, ColabraErrorResponse, ColabraApiError } from './types'

const BASE_URL = 'https://api.colabra.ai/2024-01'

type ApiResponse<T> = TypedResponse<T>

async function createComment(
  client: HttpClient,
  taskId: string,
  bodyText: string
): Promise<ColabraComment> {
  const response: ApiResponse<ColabraComment | ColabraErrorResponse> = await client.postJson(
    `${BASE_URL}/comments`,
    {
      task_id: taskId,
      body_text: bodyText
    }
  )

  const { statusCode, result } = response

  if (statusCode !== 201 && statusCode !== 200) {
    const errorBody = result as ColabraErrorResponse
    throw new ColabraApiError(
      errorBody.error.message,
      statusCode,
      errorBody.error.code
    )
  }

  return result as ColabraComment
}

export async function runAction(): Promise<void> {
  try {
    // Get inputs
    const apiKey = core.getInput('api_key', { required: true })
    const workspaceSlug = core.getInput('workspace_slug', { required: true })
    const resourceId = core.getInput('resource_id', { required: true })
    const bodyText = core.getInput('body_text', { required: true })

    // Validate inputs
    if (!resourceId.match(/^[A-Z]+-\d+$/)) {
      throw new Error('resource_id must be in the format PREFIX-NUMBER (e.g. EXP-10)')
    }

    // Create HTTP client
    const client = new HttpClient('colabra-comment-action', undefined, {
      headers: {
        'Authorization': `X-Colabra-Api-Key ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    core.debug(`Creating comment on task ${resourceId}`)
    const comment = await createComment(client, resourceId, bodyText)

    core.debug('Comment created successfully')
    core.setOutput('comment_id', comment.id)
    core.info(`Successfully posted comment ${comment.id} to task ${resourceId}`)
  } catch (error) {
    if (error instanceof ColabraApiError) {
      core.setFailed(
        `API Error (${error.statusCode}): ${error.message}${
          error.errorCode ? ` (${error.errorCode})` : ''
        }`
      )
    } else if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

if (require.main === module) {
  runAction()
} 