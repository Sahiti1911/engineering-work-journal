import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import EntryForm from './components/EntryForm.vue'
import EntryList from './components/EntryList.vue'
import { ApiError, createEntry, getDashboardSummary, listEntries, type WorkEntry } from './api'

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    listEntries: vi.fn(),
    createEntry: vi.fn(),
    getDashboardSummary: vi.fn(),
  }
})

const emptySummary = { by_project: [], by_category: [], by_month: [] }

const existingEntry: WorkEntry = {
  id: 1,
  entry_date: '2026-01-10',
  project: 'Frontend',
  title: 'Build login page',
  description: null,
  category: 'Feature',
  impact: null,
  reference: null,
  status: 'Completed',
  created_at: '2026-01-10T00:00:00+00:00',
  updated_at: '2026-01-10T00:00:00+00:00',
}

const createdEntry: WorkEntry = {
  id: 2,
  entry_date: '2026-01-11',
  project: 'Backend',
  title: 'Fix pagination bug',
  description: null,
  category: 'Bug Fix',
  impact: null,
  reference: null,
  status: 'Planned',
  created_at: '2026-01-11T00:00:00+00:00',
  updated_at: '2026-01-11T00:00:00+00:00',
}

async function fillValidForm(wrapper: ReturnType<typeof mount>) {
  await wrapper.find('#entry-date').setValue('2026-01-11')
  await wrapper.find('#title').setValue('Fix pagination bug')
  await wrapper.find('#project').setValue('Backend')
  await wrapper.find('#category').setValue('Bug Fix')
  await wrapper.find('#status').setValue('Planned')
}

describe('App', () => {
  it('mounts without errors', () => {
    vi.mocked(listEntries).mockResolvedValue([])
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(App)

    expect(wrapper.exists()).toBe(true)
  })

  it('renders EntryForm and EntryList', () => {
    vi.mocked(listEntries).mockResolvedValue([])
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(App)

    expect(wrapper.findComponent(EntryForm).exists()).toBe(true)
    expect(wrapper.findComponent(EntryList).exists()).toBe(true)
  })

  it('loads entries on initial mount', async () => {
    vi.mocked(listEntries).mockResolvedValue([existingEntry])
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(App)
    await flushPromises()

    expect(listEntries).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Build login page')
  })

  it('refreshes the entry list after a successful creation', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([existingEntry])
      .mockResolvedValueOnce([existingEntry, createdEntry])
    vi.mocked(createEntry).mockResolvedValue(createdEntry)
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(App)
    await flushPromises()
    expect(listEntries).toHaveBeenCalledTimes(1)

    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(listEntries).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Fix pagination bug')
  })

  it('does not refresh the entry list when creation fails', async () => {
    vi.mocked(listEntries).mockResolvedValue([existingEntry])
    vi.mocked(createEntry).mockRejectedValue(new ApiError(422, 'Invalid category'))
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(App)
    await flushPromises()
    expect(listEntries).toHaveBeenCalledTimes(1)

    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(listEntries).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Invalid category')
  })
})
