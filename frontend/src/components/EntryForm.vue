<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ApiError, createEntry, type Category, type Status, type WorkEntry } from '../api'

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

interface FormState {
  entry_date: string
  title: string
  description: string
  project: string
  category: Category | ''
  impact: string
  reference: string
  status: Status | ''
}

function emptyForm(): FormState {
  return {
    entry_date: '',
    title: '',
    description: '',
    project: '',
    category: '',
    impact: '',
    reference: '',
    status: '',
  }
}

const form = reactive(emptyForm())
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const emit = defineEmits<{ created: [entry: WorkEntry] }>()

function toOptional(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

async function handleSubmit() {
  if (submitting.value) return

  submitting.value = true
  error.value = null
  success.value = false

  try {
    const created = await createEntry({
      entry_date: form.entry_date,
      title: form.title,
      description: toOptional(form.description),
      project: form.project,
      category: form.category as Category,
      impact: toOptional(form.impact),
      reference: toOptional(form.reference),
      status: form.status as Status,
    })

    Object.assign(form, emptyForm())
    success.value = true
    emit('created', created)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to save work entry.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="entry-date">Date</label>
      <input id="entry-date" v-model="form.entry_date" type="date" required />
    </div>

    <div>
      <label for="title">Title</label>
      <input id="title" v-model="form.title" type="text" required />
    </div>

    <div>
      <label for="description">Description</label>
      <textarea id="description" v-model="form.description"></textarea>
    </div>

    <div>
      <label for="project">Project</label>
      <input id="project" v-model="form.project" type="text" required />
    </div>

    <div>
      <label for="category">Category</label>
      <select id="category" v-model="form.category" required>
        <option value="" disabled>Select a category</option>
        <option v-for="option in categories" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <div>
      <label for="impact">Impact</label>
      <input id="impact" v-model="form.impact" type="text" />
    </div>

    <div>
      <label for="reference">PR/ticket reference</label>
      <input id="reference" v-model="form.reference" type="text" />
    </div>

    <div>
      <label for="status">Status</label>
      <select id="status" v-model="form.status" required>
        <option value="" disabled>Select a status</option>
        <option v-for="option in statuses" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <button type="submit" :disabled="submitting">{{ submitting ? 'Saving…' : 'Add entry' }}</button>

    <p v-if="success" role="status">Work entry saved.</p>
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>
