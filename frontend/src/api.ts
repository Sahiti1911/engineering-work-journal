export type Category =
  | 'Feature'
  | 'Bug Fix'
  | 'Improvement'
  | 'Performance'
  | 'Security'
  | 'DevOps'
  | 'Investigation'
  | 'Documentation'
  | 'Other'

export type Status = 'Planned' | 'In Progress' | 'Completed' | 'Blocked'

export interface WorkEntry {
  id: number
  entry_date: string
  project: string
  title: string
  description: string | null
  category: Category
  impact: string | null
  reference: string | null
  status: Status
  created_at: string
  updated_at: string
}

export interface WorkEntryInput {
  entry_date: string
  project: string
  title: string
  description?: string | null
  category: Category
  impact?: string | null
  reference?: string | null
  status: Status
}

export interface EntryFilters {
  q?: string
  project?: string
  category?: Category
  status?: Status
  date_from?: string
  date_to?: string
}

export interface DashboardDateRange {
  date_from?: string
  date_to?: string
}

export interface ProjectCount {
  project: string
  count: number
}

export interface CategoryCount {
  category: string
  count: number
}

export interface MonthCount {
  month: string
  count: number
}

export interface DashboardSummary {
  by_project: ProjectCount[]
  by_category: CategoryCount[]
  by_month: MonthCount[]
}

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function isDetailBody(body: unknown): body is { detail: unknown } {
  return typeof body === 'object' && body !== null && 'detail' in body
}

function toQueryString(params: EntryFilters | DashboardDateRange): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value !== '') {
      search.set(key, value)
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, init)

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, isDetailBody(body) ? body.detail : body)
  }

  return body as T
}

function jsonRequest<T>(path: string, method: 'POST' | 'PUT', entry: WorkEntryInput): Promise<T> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
}

export function listEntries(filters: EntryFilters = {}): Promise<WorkEntry[]> {
  return request<WorkEntry[]>(`/api/entries${toQueryString(filters)}`)
}

export function getEntry(id: number): Promise<WorkEntry> {
  return request<WorkEntry>(`/api/entries/${id}`)
}

export function createEntry(entry: WorkEntryInput): Promise<WorkEntry> {
  return jsonRequest<WorkEntry>('/api/entries', 'POST', entry)
}

export function updateEntry(id: number, entry: WorkEntryInput): Promise<WorkEntry> {
  return jsonRequest<WorkEntry>(`/api/entries/${id}`, 'PUT', entry)
}

export function deleteEntry(id: number): Promise<void> {
  return request<void>(`/api/entries/${id}`, { method: 'DELETE' })
}

export function getDashboardSummary(range: DashboardDateRange = {}): Promise<DashboardSummary> {
  return request<DashboardSummary>(`/api/dashboard/summary${toQueryString(range)}`)
}
