<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError, getDashboardSummary, type DashboardSummary } from '../api'

const summary = ref<DashboardSummary | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const totalCount = computed(
  () => summary.value?.by_project.reduce((sum, row) => sum + row.count, 0) ?? 0,
)

async function load() {
  loading.value = true
  error.value = null
  try {
    summary.value = await getDashboardSummary()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

defineExpose({ refresh: load })
</script>

<template>
  <section>
    <h2>Dashboard</h2>
    <p v-if="loading">Loading dashboard…</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <template v-else-if="summary">
      <p>Total work entries: {{ totalCount }}</p>
      <p v-if="totalCount === 0">No work entries yet.</p>
      <template v-else>
        <div>
          <h3>By Project</h3>
          <ul>
            <li v-for="row in summary.by_project" :key="row.project">
              {{ row.project }}: {{ row.count }}
            </li>
          </ul>
        </div>

        <div>
          <h3>By Category</h3>
          <ul>
            <li v-for="row in summary.by_category" :key="row.category">
              {{ row.category }}: {{ row.count }}
            </li>
          </ul>
        </div>

        <div>
          <h3>By Month</h3>
          <ul>
            <li v-for="row in summary.by_month" :key="row.month">
              {{ row.month }}: {{ row.count }}
            </li>
          </ul>
        </div>
      </template>
    </template>
  </section>
</template>
