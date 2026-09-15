<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  ApiError,
  deleteEntry,
  listEntries,
  updateEntry,
  type Category,
  type Status,
  type WorkEntry,
} from '../api'

const categories: Category[] = [
  'Feature',
  'Bug Fix',
  'Improvement',
  'Performance',
  'Security',
  'DevOps',
  'Investigation',
  'Documentation',
  'Other',
]

const statuses: Status[] = ['Planned', 'In Progress', 'Completed', 'Blocked']

const entries = ref<WorkEntry[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const deletingIds = ref(new Set<number>())
const searchQuery = ref('')
const categoryFilter = ref<Category | ''>('')
const statusFilter = ref<Status | ''>('')
const dateFromFilter = ref('')
const dateToFilter = ref('')
const dateRangeError = ref<string | null>(null)

async function load() {
  if (dateFromFilter.value && dateToFilter.value && dateFromFilter.value > dateToFilter.value) {
    dateRangeError.value = 'The "From" date must not be later than the "To" date.'
    return
  }
  dateRangeError.value = null

  loading.value = true
  error.value = null
  try {
    entries.value = await listEntries({
      q: searchQuery.value,
      category: categoryFilter.value || undefined,
      status: statusFilter.value || undefined,
      date_from: dateFromFilter.value || undefined,
      date_to: dateToFilter.value || undefined,
    })
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load work entries.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function handleSearchSubmit() {
  load()
}

function handleClearSearch() {
  searchQuery.value = ''
  load()
}

async function handleDelete(id: number) {
  if (deletingIds.value.has(id)) return

  deletingIds.value.add(id)
  deleteError.value = null
  try {
    await deleteEntry(id)
    await load()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Failed to delete work entry.'
  } finally {
    deletingIds.value.delete(id)
  }
}

interface EditFormState {
  entry_date: string
  title: string
  description: string
  project: string
  category: Category | ''
  impact: string
  reference: string
  status: Status | ''
}

const editingId = ref<number | null>(null)
const updating = ref(false)
const updateError = ref<string | null>(null)
const editForm = reactive<EditFormState>({
  entry_date: '',
  title: '',
  description: '',
  project: '',
  category: '',
  impact: '',
  reference: '',
  status: '',
})

function startEdit(entry: WorkEntry) {
  editingId.value = entry.id
  updateError.value = null
  editForm.entry_date = entry.entry_date
  editForm.title = entry.title
  editForm.description = entry.description ?? ''
  editForm.project = entry.project
  editForm.category = entry.category
  editForm.impact = entry.impact ?? ''
  editForm.reference = entry.reference ?? ''
  editForm.status = entry.status
}

function cancelEdit() {
  editingId.value = null
  updateError.value = null
}

function toOptional(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

async function saveEdit(id: number) {
  if (updating.value) return

  updating.value = true
  updateError.value = null
  try {
    await updateEntry(id, {
      entry_date: editForm.entry_date,
      title: editForm.title,
      description: toOptional(editForm.description),
      project: editForm.project,
      category: editForm.category as Category,
      impact: toOptional(editForm.impact),
      reference: toOptional(editForm.reference),
      status: editForm.status as Status,
    })
    editingId.value = null
    await load()
  } catch (err) {
    updateError.value = err instanceof ApiError ? err.message : 'Failed to update work entry.'
  } finally {
    updating.value = false
  }
}

defineExpose({ refresh: load })
</script>

<template>
  <section>
    <form @submit.prevent="handleSearchSubmit">
      <label for="search">Search</label>
      <input
        id="search"
        v-model="searchQuery"
        type="text"
        placeholder="Search title or description"
      />

      <label for="category-filter">Category</label>
      <select id="category-filter" v-model="categoryFilter" @change="load">
        <option value="">All</option>
        <option v-for="option in categories" :key="option" :value="option">{{ option }}</option>
      </select>

      <label for="status-filter">Status</label>
      <select id="status-filter" v-model="statusFilter" @change="load">
        <option value="">All</option>
        <option v-for="option in statuses" :key="option" :value="option">{{ option }}</option>
      </select>

      <label for="date-from-filter">From</label>
      <input id="date-from-filter" v-model="dateFromFilter" type="date" @change="load" />

      <label for="date-to-filter">To</label>
      <input id="date-to-filter" v-model="dateToFilter" type="date" @change="load" />

      <button type="submit">Search</button>
      <button type="button" @click="handleClearSearch">Clear</button>

      <p v-if="dateRangeError" role="alert">{{ dateRangeError }}</p>
    </form>

    <p v-if="loading">Loading entries…</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else-if="entries.length === 0">
      {{ searchQuery ? 'No entries match your search.' : 'No work entries yet.' }}
    </p>
    <template v-else>
      <p v-if="deleteError" role="alert">{{ deleteError }}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Project</th>
            <th>Category</th>
            <th>Status</th>
            <th>Impact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="entry in entries" :key="entry.id">
            <tr>
              <td>{{ entry.entry_date }}</td>
              <td>{{ entry.title }}</td>
              <td>{{ entry.project }}</td>
              <td>{{ entry.category }}</td>
              <td>{{ entry.status }}</td>
              <td>{{ entry.impact ?? '—' }}</td>
              <td>
                <button type="button" @click="startEdit(entry)">Edit</button>
                <button
                  type="button"
                  :disabled="deletingIds.has(entry.id)"
                  @click="handleDelete(entry.id)"
                >
                  {{ deletingIds.has(entry.id) ? 'Deleting…' : 'Delete' }}
                </button>
              </td>
            </tr>
            <tr v-if="editingId === entry.id">
              <td colspan="7">
                <p v-if="updateError" role="alert">{{ updateError }}</p>
                <div>
                  <label :for="`edit-date-${entry.id}`">Date</label>
                  <input
                    :id="`edit-date-${entry.id}`"
                    v-model="editForm.entry_date"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <label :for="`edit-title-${entry.id}`">Title</label>
                  <input
                    :id="`edit-title-${entry.id}`"
                    v-model="editForm.title"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label :for="`edit-description-${entry.id}`">Description</label>
                  <textarea
                    :id="`edit-description-${entry.id}`"
                    v-model="editForm.description"
                  ></textarea>
                </div>
                <div>
                  <label :for="`edit-project-${entry.id}`">Project</label>
                  <input
                    :id="`edit-project-${entry.id}`"
                    v-model="editForm.project"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label :for="`edit-category-${entry.id}`">Category</label>
                  <select :id="`edit-category-${entry.id}`" v-model="editForm.category" required>
                    <option v-for="option in categories" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>
                <div>
                  <label :for="`edit-impact-${entry.id}`">Impact</label>
                  <input :id="`edit-impact-${entry.id}`" v-model="editForm.impact" type="text" />
                </div>
                <div>
                  <label :for="`edit-reference-${entry.id}`">PR/ticket reference</label>
                  <input
                    :id="`edit-reference-${entry.id}`"
                    v-model="editForm.reference"
                    type="text"
                  />
                </div>
                <div>
                  <label :for="`edit-status-${entry.id}`">Status</label>
                  <select :id="`edit-status-${entry.id}`" v-model="editForm.status" required>
                    <option v-for="option in statuses" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>
                <button type="button" :disabled="updating" @click="saveEdit(entry.id)">
                  {{ updating ? 'Saving…' : 'Save' }}
                </button>
                <button type="button" :disabled="updating" @click="cancelEdit">Cancel</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </section>
</template>
