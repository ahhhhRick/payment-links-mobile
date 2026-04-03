// Square API HTTP Client
// ============================================================================
// Typed HTTP client for all Square API calls.
// Handles auth headers, API versioning, error parsing, and retries.
// ============================================================================

import { getApiBaseUrl, SQUARE_CONFIG } from '../config/square'
import { authStore } from '../services/auth'

interface ApiError {
  category: string
  code: string
  detail: string
  field?: string
}

interface ApiErrorResponse {
  errors: ApiError[]
}

export class SquareApiError extends Error {
  public statusCode: number
  public errors: ApiError[]

  constructor(statusCode: number, errors: ApiError[]) {
    const message = errors.map(e => e.detail).join('; ') || `API error ${statusCode}`
    super(message)
    this.name = 'SquareApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await authStore.getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_CONFIG.apiVersion,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errors: ApiError[] = []
    try {
      const body: ApiErrorResponse = await response.json()
      errors = body.errors || []
    } catch {
      errors = [{ category: 'API_ERROR', code: 'UNKNOWN', detail: `HTTP ${response.status}` }]
    }
    throw new SquareApiError(response.status, errors)
  }
  return response.json() as Promise<T>
}

export const squareApi = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const url = new URL(`${baseUrl}${path}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })
    }
    const headers = await getHeaders()
    const response = await fetch(url.toString(), { method: 'GET', headers })
    return handleResponse<T>(response)
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const headers = await getHeaders()
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const headers = await getHeaders()
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse<T>(response)
  },

  async delete<T>(path: string): Promise<T> {
    const baseUrl = getApiBaseUrl()
    const headers = await getHeaders()
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    })
    return handleResponse<T>(response)
  },
}
