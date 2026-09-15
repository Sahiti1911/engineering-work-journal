import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Dashboard from './DashboardView.vue'
import { ApiError, getDashboardSummary, type DashboardSummary } from '../api'

vi.mock('../api', async () => {
  const actual = await vi.importActual<typeof import('../api')>('../api')
  return {
    ...actual,
    getDashboardSummary: vi.fn(),
  }
})

const sampleSummary: DashboardSummary = {
  by_project: [
    { project: 'Backend', count: 1 },
    { project: 'Frontend', count: 2 },
  ],
  by_category: [
    { category: 'Bug Fix', count: 1 },
    { category: 'Feature', count: 2 },
  ],
  by_month: [
    { month: '2026-01', count: 2 },
    { month: '2026-02', count: 1 },
  ],
}

const emptySummary: DashboardSummary = {
  by_project: [],
  by_category: [],
  by_month: [],
}

describe('Dashboard', () => {
  it('renders', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(sampleSummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
  })

  it('shows a loading state before the summary resolves', () => {
    vi.mocked(getDashboardSummary).mockReturnValue(new Promise(() => {}))

    const wrapper = mount(Dashboard)

    expect(wrapper.text()).toContain('Loading')
  })

  it('displays the total entry count', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(sampleSummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Total work entries: 3')
  })

  it('renders counts by project', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(sampleSummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Backend: 1')
    expect(wrapper.text()).toContain('Frontend: 2')
  })

  it('renders counts by category', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(sampleSummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Bug Fix: 1')
    expect(wrapper.text()).toContain('Feature: 2')
  })

  it('renders counts by month', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(sampleSummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('2026-01: 2')
    expect(wrapper.text()).toContain('2026-02: 1')
  })

  it('shows an error message when the request fails', async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(new ApiError(500, 'Failed to load dashboard'))

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Failed to load dashboard')
  })

  it('handles empty data without errors', async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue(emptySummary)

    const wrapper = mount(Dashboard)
    await flushPromises()

    expect(wrapper.text()).toContain('Total work entries: 0')
    expect(wrapper.text()).toContain('No work entries yet.')
  })
})
