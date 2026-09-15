import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import EntryList from './EntryList.vue'
import { ApiError, deleteEntry, listEntries, updateEntry, type WorkEntry } from '../api'

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof import('../api')>('../api')
  return {
    ...actual,
    listEntries: vi.fn(),
    deleteEntry: vi.fn(),
    updateEntry: vi.fn(),
  }
})

function deleteButtons(wrapper: VueWrapper) {
  return wrapper.findAll('button').filter((b) => b.text().includes('Delete'))
}

function editButtons(wrapper: VueWrapper) {
  return wrapper.findAll('button').filter((b) => b.text() === 'Edit')
}

const sampleEntry: WorkEntry = {
  id: 1,
  entry_date: '2026-01-10',
  project: 'Frontend',
  title: 'Build login page',
  description: 'Implemented OAuth login flow',
  category: 'Feature',
  impact: 'Improved onboarding',
  reference: null,
  status: 'Completed',
  created_at: '2026-01-10T00:00:00+00:00',
  updated_at: '2026-01-10T00:00:00+00:00',
}

const secondEntry: WorkEntry = {
  id: 2,
  entry_date: '2026-01-12',
  project: 'Backend',
  title: 'Fix pagination bug',
  description: null,
  category: 'Bug Fix',
  impact: null,
  reference: null,
  status: 'Planned',
  created_at: '2026-01-12T00:00:00+00:00',
  updated_at: '2026-01-12T00:00:00+00:00',
}

describe('EntryList', () => {
  it('shows a loading state before entries resolve', () => {
    vi.mocked(listEntries).mockReturnValue(new Promise(() => {}))

    const wrapper = mount(EntryList)

    expect(wrapper.text()).toContain('Loading')
  })

  it('renders entries once loaded', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(wrapper.text()).toContain('2026-01-10')
    expect(wrapper.text()).toContain('Build login page')
    expect(wrapper.text()).toContain('Frontend')
    expect(wrapper.text()).toContain('Feature')
    expect(wrapper.text()).toContain('Completed')
    expect(wrapper.text()).toContain('Improved onboarding')
  })

  it('shows an empty state when there are no entries', async () => {
    vi.mocked(listEntries).mockResolvedValue([])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(wrapper.text()).toContain('No work entries yet')
  })

  it('shows an error message when the request fails', async () => {
    vi.mocked(listEntries).mockRejectedValue(new ApiError(500, 'Failed to load work entries'))

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load work entries')
  })

  it('renders a delete action for every row', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(deleteButtons(wrapper)).toHaveLength(2)
  })

  it('calls deleteEntry with the correct id when delete is clicked', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])
    vi.mocked(deleteEntry).mockResolvedValue(undefined)

    const wrapper = mount(EntryList)
    await flushPromises()

    await deleteButtons(wrapper)[1].trigger('click')

    expect(deleteEntry).toHaveBeenCalledWith(2)
  })

  it('refreshes the list after a successful delete', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([sampleEntry, secondEntry])
      .mockResolvedValueOnce([sampleEntry])
    vi.mocked(deleteEntry).mockResolvedValue(undefined)

    const wrapper = mount(EntryList)
    await flushPromises()
    expect(listEntries).toHaveBeenCalledTimes(1)

    await deleteButtons(wrapper)[1].trigger('click')
    await flushPromises()

    expect(listEntries).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Fix pagination bug')
  })

  it('shows an error and keeps the entry when delete fails', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])
    vi.mocked(deleteEntry).mockRejectedValue(new ApiError(500, 'Failed to delete work entry'))

    const wrapper = mount(EntryList)
    await flushPromises()

    await deleteButtons(wrapper)[1].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to delete work entry')
    expect(wrapper.text()).toContain('Fix pagination bug')
    expect(listEntries).toHaveBeenCalledTimes(1)
  })

  it('prevents duplicate delete requests for the same entry while one is in progress', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])
    vi.mocked(deleteEntry).mockReturnValue(new Promise(() => {}))

    const wrapper = mount(EntryList)
    await flushPromises()

    const button = deleteButtons(wrapper)[1]
    await button.trigger('click')
    await button.trigger('click')

    expect(deleteEntry).toHaveBeenCalledTimes(1)
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('renders an edit action for every row', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(editButtons(wrapper)).toHaveLength(2)
  })

  it('shows the existing values in editable fields when Edit is clicked', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')

    expect((wrapper.find('#edit-title-1').element as HTMLInputElement).value).toBe(
      'Build login page',
    )
    expect((wrapper.find('#edit-date-1').element as HTMLInputElement).value).toBe('2026-01-10')
    expect((wrapper.find('#edit-project-1').element as HTMLInputElement).value).toBe('Frontend')
    expect((wrapper.find('#edit-category-1').element as HTMLSelectElement).value).toBe('Feature')
    expect((wrapper.find('#edit-status-1').element as HTMLSelectElement).value).toBe('Completed')
    expect((wrapper.find('#edit-impact-1').element as HTMLInputElement).value).toBe(
      'Improved onboarding',
    )
    expect((wrapper.find('#edit-description-1').element as HTMLTextAreaElement).value).toBe(
      'Implemented OAuth login flow',
    )
  })

  it('calls updateEntry with the correct id and edited values on save', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])
    vi.mocked(updateEntry).mockResolvedValue({ ...sampleEntry, title: 'Build login page (v2)' })

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')
    await wrapper.find('#edit-title-1').setValue('Build login page (v2)')
    await wrapper
      .findAll('button')
      .find((b) => b.text().startsWith('Save'))
      ?.trigger('click')

    expect(updateEntry).toHaveBeenCalledWith(1, {
      entry_date: '2026-01-10',
      title: 'Build login page (v2)',
      description: 'Implemented OAuth login flow',
      project: 'Frontend',
      category: 'Feature',
      impact: 'Improved onboarding',
      reference: null,
      status: 'Completed',
    })
  })

  it('exits edit mode and refreshes the list after a successful save', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([sampleEntry])
      .mockResolvedValueOnce([{ ...sampleEntry, title: 'Build login page (v2)' }])
    vi.mocked(updateEntry).mockResolvedValue({ ...sampleEntry, title: 'Build login page (v2)' })

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text().startsWith('Save'))
      ?.trigger('click')
    await flushPromises()

    expect(wrapper.find('#edit-title-1').exists()).toBe(false)
    expect(listEntries).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Build login page (v2)')
  })

  it('cancel exits edit mode without calling updateEntry', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')
    expect(wrapper.find('#edit-title-1').exists()).toBe(true)

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
      ?.trigger('click')

    expect(wrapper.find('#edit-title-1').exists()).toBe(false)
    expect(updateEntry).not.toHaveBeenCalled()
  })

  it('shows an error and keeps the entry when update fails', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])
    vi.mocked(updateEntry).mockRejectedValue(new ApiError(500, 'Failed to update work entry'))

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')
    await wrapper
      .findAll('button')
      .find((b) => b.text().startsWith('Save'))
      ?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to update work entry')
    expect(wrapper.find('#edit-title-1').exists()).toBe(true)
    expect(wrapper.text()).toContain('Fix pagination bug')
    expect(listEntries).toHaveBeenCalledTimes(1)
  })

  it('prevents duplicate save submissions while an update is in progress', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])
    vi.mocked(updateEntry).mockReturnValue(new Promise(() => {}))

    const wrapper = mount(EntryList)
    await flushPromises()

    await editButtons(wrapper)[0].trigger('click')
    const saveButton = wrapper.findAll('button').find((b) => b.text().startsWith('Save'))
    await saveButton?.trigger('click')
    await saveButton?.trigger('click')

    expect(updateEntry).toHaveBeenCalledTimes(1)
    expect(saveButton?.attributes('disabled')).toBeDefined()
  })

  it('renders a search input', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(wrapper.find('label[for="search"]').exists()).toBe(true)
    expect(wrapper.find('#search').exists()).toBe(true)
  })

  it('calls listEntries with the entered search text on submit', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#search').setValue('login')
    await wrapper.find('form').trigger('submit')

    expect(listEntries).toHaveBeenLastCalledWith({ q: 'login' })
  })

  it('replaces the displayed list with the search results', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([sampleEntry, secondEntry])
      .mockResolvedValueOnce([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()
    expect(wrapper.text()).toContain('Fix pagination bug')

    await wrapper.find('#search').setValue('login')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Build login page')
    expect(wrapper.text()).not.toContain('Fix pagination bug')
  })

  it('treats an empty search as an unfiltered request', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry, secondEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#search').setValue('something')
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Clear')
      ?.trigger('click')
    await flushPromises()

    expect(listEntries).toHaveBeenLastCalledWith({ q: '' })
    expect((wrapper.find('#search').element as HTMLInputElement).value).toBe('')
  })

  it('shows an error when a search request fails', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([sampleEntry])
      .mockRejectedValueOnce(new ApiError(500, 'Failed to load work entries'))

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#search').setValue('login')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load work entries')
  })

  it('renders Category and Status filter selects with an All option', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    const categorySelect = wrapper.find('#category-filter')
    const statusSelect = wrapper.find('#status-filter')
    expect(categorySelect.exists()).toBe(true)
    expect(statusSelect.exists()).toBe(true)

    const categoryOptions = categorySelect.findAll('option').map((o) => o.text())
    const statusOptions = statusSelect.findAll('option').map((o) => o.text())
    expect(categoryOptions[0]).toBe('All')
    expect(statusOptions[0]).toBe('All')
  })

  it('sends the category filter to listEntries when a category is selected', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#category-filter').setValue('Bug Fix')

    expect(listEntries).toHaveBeenLastCalledWith({ q: '', category: 'Bug Fix', status: undefined })
  })

  it('sends the status filter to listEntries when a status is selected', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#status-filter').setValue('Completed')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: '',
      category: undefined,
      status: 'Completed',
    })
  })

  it('sends search, category, and status together in one request', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#search').setValue('API')
    await wrapper.find('#category-filter').setValue('Bug Fix')
    await wrapper.find('#status-filter').setValue('Completed')
    await wrapper.find('form').trigger('submit')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: 'API',
      category: 'Bug Fix',
      status: 'Completed',
    })
  })

  it('removes the filter when All is selected again', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#category-filter').setValue('Bug Fix')
    await wrapper.find('#category-filter').setValue('')

    expect(listEntries).toHaveBeenLastCalledWith({ q: '', category: undefined, status: undefined })
  })

  it('shows an error when a filtered request fails', async () => {
    vi.mocked(listEntries)
      .mockResolvedValueOnce([sampleEntry])
      .mockRejectedValueOnce(new ApiError(500, 'Failed to load work entries'))

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#status-filter').setValue('Completed')
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load work entries')
  })

  it('renders From and To date filter inputs', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    expect(wrapper.find('label[for="date-from-filter"]').exists()).toBe(true)
    expect(wrapper.find('#date-from-filter').exists()).toBe(true)
    expect(wrapper.find('label[for="date-to-filter"]').exists()).toBe(true)
    expect(wrapper.find('#date-to-filter').exists()).toBe(true)
  })

  it('sends date_from to listEntries when From is set', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#date-from-filter').setValue('2026-01-01')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: '',
      category: undefined,
      status: undefined,
      date_from: '2026-01-01',
      date_to: undefined,
    })
  })

  it('sends date_to to listEntries when To is set', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#date-to-filter').setValue('2026-03-31')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: '',
      category: undefined,
      status: undefined,
      date_from: undefined,
      date_to: '2026-03-31',
    })
  })

  it('sends search, category, status, and date range together in one request', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#search').setValue('API')
    await wrapper.find('#category-filter').setValue('Bug Fix')
    await wrapper.find('#status-filter').setValue('Completed')
    await wrapper.find('#date-from-filter').setValue('2026-01-01')
    await wrapper.find('#date-to-filter').setValue('2026-03-31')
    await wrapper.find('form').trigger('submit')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: 'API',
      category: 'Bug Fix',
      status: 'Completed',
      date_from: '2026-01-01',
      date_to: '2026-03-31',
    })
  })

  it('rejects an invalid date range without sending a request', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    // Setting "From" alone is a valid partial state and does trigger a request.
    await wrapper.find('#date-from-filter').setValue('2026-03-31')
    const callsAfterFrom = vi.mocked(listEntries).mock.calls.length

    // Setting "To" earlier than "From" makes the range invalid — no new request.
    await wrapper.find('#date-to-filter').setValue('2026-01-01')

    expect(listEntries).toHaveBeenCalledTimes(callsAfterFrom)
    expect(wrapper.text()).toContain('must not be later than')
  })

  it('reloads the list once a previously invalid range becomes valid', async () => {
    vi.mocked(listEntries).mockResolvedValue([sampleEntry])

    const wrapper = mount(EntryList)
    await flushPromises()

    await wrapper.find('#date-from-filter').setValue('2026-03-31')
    await wrapper.find('#date-to-filter').setValue('2026-01-01')
    expect(wrapper.text()).toContain('must not be later than')

    await wrapper.find('#date-to-filter').setValue('2026-12-31')

    expect(listEntries).toHaveBeenLastCalledWith({
      q: '',
      category: undefined,
      status: undefined,
      date_from: '2026-03-31',
      date_to: '2026-12-31',
    })
    expect(wrapper.text()).not.toContain('must not be later than')
  })
})
