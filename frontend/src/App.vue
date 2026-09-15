<script setup lang="ts">
import { useTemplateRef } from 'vue'
import DashboardView from './components/DashboardView.vue'
import EntryForm from './components/EntryForm.vue'
import EntryList from './components/EntryList.vue'

const entryList = useTemplateRef('entryList')

function handleCreated() {
  entryList.value?.refresh()
}
</script>

<template>
  <main>
    <h1>Engineering Work Journal</h1>
    <DashboardView />
    <EntryForm @created="handleCreated" />
    <EntryList ref="entryList" />
  </main>
</template>
