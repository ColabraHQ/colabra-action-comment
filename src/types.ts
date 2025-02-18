export interface ColabraComment {
  id: string
  task_id?: string
  project_id?: string
  body_text: string
  created_at: string
  updated_at: string
}

export interface ColabraErrorResponse {
  error: {
    message: string
    code: string
  }
}

export class ColabraApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errorCode?: string
  ) {
    super(message)
    this.name = 'ColabraApiError'
  }
}

export type ResourceType = 'task' | 'project'

export interface ResourceIdInfo {
  type: ResourceType
  id: string
} 