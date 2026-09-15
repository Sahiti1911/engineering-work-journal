import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createEntry,
  deleteEntry,
  getDashboardSummary,
  getEntry,
  listEntries,
  updateEntry,
  type WorkEntry,
} from './api'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const sampleEntry: WorkEntry = {
  id: 1,
  entry_date: '2026-01-10',
  project: 'Frontend',
  title: 'Build login page',
  description: 'Implemented OAuth login flow',
  category: 'Feature',
  impact: null,
  reference: null,
  status: 'Completed',
  created_at: '2026-01-10T00:00:00+00:00',
  updated_at: '2026-01-10T00:00:00+00:00',
}

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('lists entries with filters as a query string', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([sampleEntry]))

    const result = await listEntries({ project: 'Frontend', category: 'Feature' })

    expect(result).toEqual([sampleEntry])
    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('/api/entries?project=Frontend&category=Feature')
  })

  it('lists entries with no filters and no query string', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse([]))

    await listEntries()

    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('/api/entries')
  })

  it('gets a single entry by id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(sampleEntry))

    const result = await getEntry(1)

    expect(result).toEqual(sampleEntry)
  })

  it('creates an entry with a JSON body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse(sampleEntry, 201))

    const result = await createEntry({
      entry_date: '2026-01-10',
      project: 'Frontend',
      title: 'Build login page',
      category: 'Feature',
      status: 'Completed',
    })

    expect(result).toEqual(sampleEntry)
    const [, init] = fetchMock.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  it('updates an entry', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(sampleEntry))

    await updateEntry(1, {
      entry_date: '2026-01-10',
      project: 'Frontend',
      title: 'Build login page',
      category: 'Feature',
      status: 'Completed',
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('/api/entries/1')
    expect(init?.method).toBe('PUT')
  })

  it('deletes an entry and handles 204 with no body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await expect(deleteEntry(1)).resolves.toBeUndefined()
  })

  it('gets dashboard summary with a date range query string', async () => {
    const summary = { by_project: [], by_category: [], by_month: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(summary))

    const result = await getDashboardSummary({ date_from: '2026-01-01', date_to: '2026-03-31' })

    expect(result).toEqual(summary)
    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('/api/dashboard/summary?date_from=2026-01-01&date_to=2026-03-31')
  })

  it('throws ApiError with the detail message on a non-2xx response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ detail: 'Work entry not found' }, 404),
    )

    await expect(getEntry(999)).rejects.toMatchObject({
      status: 404,
      detail: 'Work entry not found',
    })
  })
})
