import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { TypedResponse } from '@actions/http-client/lib/interfaces'
import { IncomingHttpHeaders } from 'http'
import { ColabraComment, ColabraErrorResponse } from './types'
import { InputOptions } from '@actions/core'
import { runAction } from './index'

// Add types for mocked responses
type MockedResponse<T> = {
  statusCode: number
  result: T
  headers: IncomingHttpHeaders
}

// Mock modules
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  debug: jest.fn(),
  info: jest.fn()
}))

jest.mock('@actions/http-client', () => {
  return {
    HttpClient: jest.fn().mockImplementation(() => ({
      postJson: jest.fn()
    }))
  }
})

describe('Colabra Comment Action', () => {
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new HttpClient() as jest.Mocked<HttpClient>
  })

  it('shall post a comment on a task successfully', async () => {
    // Arrange
    const inputs = {
      'api_key': 'test-api-key',
      'workspace_slug': 'test-workspace',
      'resource_id': 'TSK-123',
      'body_text': 'Test comment'
    }

    const mockResponse: MockedResponse<ColabraComment> = {
      statusCode: 201,
      headers: {
        'content-type': 'application/json'
      },
      result: {
        id: 'comment-123',
        task_id: 'TSK-123',
        body_text: 'Test comment',
        created_at: '2024-02-20T12:00:00Z',
        updated_at: '2024-02-20T12:00:00Z'
      }
    }

    // Setup mocks
    jest.mocked(core.getInput).mockImplementation((name: string) => inputs[name as keyof typeof inputs])
    mockHttpClient.postJson = jest.fn().mockResolvedValueOnce(mockResponse)
    jest.mocked(HttpClient).mockImplementation(() => mockHttpClient)

    // Act
    await runAction()

    // Assert
    expect(HttpClient).toHaveBeenCalledWith(
      'colabra-comment-action',
      undefined,
      {
        headers: {
          'Authorization': 'X-Colabra-Api-Key test-api-key',
          'Content-Type': 'application/json'
        }
      }
    )

    expect(mockHttpClient.postJson).toHaveBeenCalledWith(
      'https://api.colabra.ai/2024-01/comments',
      {
        task_id: 'TSK-123',
        body_text: 'Test comment'
      }
    )

    expect(core.setOutput).toHaveBeenCalledWith('comment_id', 'comment-123')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('shall post a comment on a project successfully', async () => {
    // Arrange
    const inputs = {
      'api_key': 'test-api-key',
      'workspace_slug': 'test-workspace',
      'resource_id': 'PRO-123',
      'body_text': 'Test comment'
    }

    const mockResponse: MockedResponse<ColabraComment> = {
      statusCode: 201,
      headers: {
        'content-type': 'application/json'
      },
      result: {
        id: 'comment-123',
        project_id: 'PRO-123',
        body_text: 'Test comment',
        created_at: '2024-02-20T12:00:00Z',
        updated_at: '2024-02-20T12:00:00Z'
      }
    }

    // Setup mocks
    jest.mocked(core.getInput).mockImplementation((name: string) => inputs[name as keyof typeof inputs])
    mockHttpClient.postJson = jest.fn().mockResolvedValueOnce(mockResponse)
    jest.mocked(HttpClient).mockImplementation(() => mockHttpClient)

    // Act
    await runAction()

    // Assert
    expect(mockHttpClient.postJson).toHaveBeenCalledWith(
      'https://api.colabra.ai/2024-01/comments',
      {
        project_id: 'PRO-123',
        body_text: 'Test comment'
      }
    )

    expect(core.setOutput).toHaveBeenCalledWith('comment_id', 'comment-123')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('shall handle API errors appropriately', async () => {
    // Arrange
    const inputs = {
      'api_key': 'test-api-key',
      'workspace_slug': 'test-workspace',
      'resource_id': 'TSK-123',
      'body_text': 'Test comment'
    }

    const mockResponse: MockedResponse<ColabraErrorResponse> = {
      statusCode: 400,
      headers: {
        'content-type': 'application/json'
      },
      result: {
        error: {
          message: 'Invalid task ID',
          code: 'INVALID_TASK_ID'
        }
      }
    }

    // Setup mocks
    jest.mocked(core.getInput).mockImplementation((name: string) => inputs[name as keyof typeof inputs])
    mockHttpClient.postJson = jest.fn().mockResolvedValueOnce(mockResponse)
    jest.mocked(HttpClient).mockImplementation(() => mockHttpClient)

    // Act
    await runAction()

    // Assert
    expect(core.setFailed).toHaveBeenCalledWith(
      'API Error (400): Invalid task ID (INVALID_TASK_ID)'
    )
  })

  it('shall validate resource_id format for tasks', async () => {
    // Arrange
    const inputs = {
      'api_key': 'test-api-key',
      'workspace_slug': 'test-workspace',
      'resource_id': 'TASK-123',
      'body_text': 'Test comment'
    }

    // Setup mocks
    jest.mocked(core.getInput).mockImplementation((name: string) => inputs[name as keyof typeof inputs])
    mockHttpClient.postJson = jest.fn()
    jest.mocked(HttpClient).mockImplementation(() => mockHttpClient)

    // Act
    await runAction()

    // Assert
    expect(core.setFailed).toHaveBeenCalledWith(
      'resource_id must be in the format TSK-123 or PRO-123'
    )
    expect(mockHttpClient.postJson).not.toHaveBeenCalled()
  })

  it('shall validate resource_id format for projects', async () => {
    // Arrange
    const inputs = {
      'api_key': 'test-api-key',
      'workspace_slug': 'test-workspace',
      'resource_id': 'PROJECT-123',
      'body_text': 'Test comment'
    }

    // Setup mocks
    jest.mocked(core.getInput).mockImplementation((name: string) => inputs[name as keyof typeof inputs])
    mockHttpClient.postJson = jest.fn()
    jest.mocked(HttpClient).mockImplementation(() => mockHttpClient)

    // Act
    await runAction()

    // Assert
    expect(core.setFailed).toHaveBeenCalledWith(
      'resource_id must be in the format TSK-123 or PRO-123'
    )
    expect(mockHttpClient.postJson).not.toHaveBeenCalled()
  })
}) 