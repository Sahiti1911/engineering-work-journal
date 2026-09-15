import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import EntryForm from './EntryForm.vue'
import { ApiError, createEntry, type WorkEntry } from '../api'

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof import('../api')>('../api')
  return {
    ...actual,
    createEntry: vi.fn(),
  }
})

const createdEntry: WorkEntry = {
  id: 1,
  entry_date: '2026-01-10',
  project: 'Frontend',
  title: 'Build login page',
  description: 'Implemented OAuth login flow',
  category: 'Feature',
  impact: 'Improved onboarding',
  reference: 'PR #12',
  status: 'Completed',
  created_at: '2026-01-10T00:00:00+00:00',
  updated_at: '2026-01-10T00:00:00+00:00',
}

async function fillValidForm(wrapper: VueWrapper) {
  await wrapper.find('#entry-date').setValue('2026-01-10')
  await wrapper.find('#title').setValue('Build login page')
  await wrapper.find('#description').setValue('Implemented OAuth login flow')
  await wrapper.find('#project').setValue('Frontend')
  await wrapper.find('#category').setValue('Feature')
  await wrapper.find('#impact').setValue('Improved onboarding')
  await wrapper.find('#reference').setValue('PR #12')
  await wrapper.find('#status').setValue('Completed')
}

describe('EntryForm', () => {
  it('renders all required fields', () => {
    const wrapper = mount(EntryForm)

    for (const id of [
      'entry-date',
      'title',
      'description',
      'project',
      'category',
      'impact',
      'reference',
      'status',
    ]) {
      expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
      expect(wrapper.find(`#${id}`).exists()).toBe(true)
    }
  })

  it('lets the user enter values', async () => {
    const wrapper = mount(EntryForm)

    await fillValidForm(wrapper)

    expect((wrapper.find('#title').element as HTMLInputElement).value).toBe('Build login page')
    expect((wrapper.find('#category').element as HTMLSelectElement).value).toBe('Feature')
  })

  it('calls createEntry with the expected payload on valid submission', async () => {
    vi.mocked(createEntry).mockResolvedValue(createdEntry)
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')

    expect(createEntry).toHaveBeenCalledWith({
      entry_date: '2026-01-10',
      title: 'Build login page',
      description: 'Implemented OAuth login flow',
      project: 'Frontend',
      category: 'Feature',
      impact: 'Improved onboarding',
      reference: 'PR #12',
      status: 'Completed',
    })
  })

  it('shows a submitting state while the request is in progress', async () => {
    vi.mocked(createEntry).mockReturnValue(new Promise(() => {}))
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Saving')
    expect((wrapper.find('button[type="submit"]').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows a success message and resets the form after a successful submission', async () => {
    vi.mocked(createEntry).mockResolvedValue(createdEntry)
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('saved')
    expect((wrapper.find('#title').element as HTMLInputElement).value).toBe('')
  })

  it('emits a created event with the new entry on success', async () => {
    vi.mocked(createEntry).mockResolvedValue(createdEntry)
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('created')).toEqual([[createdEntry]])
  })

  it('shows an error message when the API call fails', async () => {
    vi.mocked(createEntry).mockRejectedValue(new ApiError(422, 'Invalid category'))
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid category')
  })

  it('preserves user input after an API failure', async () => {
    vi.mocked(createEntry).mockRejectedValue(new ApiError(500, 'Failed to save work entry'))
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect((wrapper.find('#title').element as HTMLInputElement).value).toBe('Build login page')
    expect((wrapper.find('#project').element as HTMLInputElement).value).toBe('Frontend')
  })

  it('prevents duplicate submissions while a request is in progress', async () => {
    vi.mocked(createEntry).mockReturnValue(new Promise(() => {}))
    const wrapper = mount(EntryForm)
    await fillValidForm(wrapper)

    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')

    expect(createEntry).toHaveBeenCalledTimes(1)
  })
})
