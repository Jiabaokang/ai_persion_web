<script setup lang="ts">
import type { MarkdownImportResult } from '~/composables/useMarkdownImport'

const emit = defineEmits<{
  imported: [payload: MarkdownImportResult]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement>()
const reading = ref(false)

// 打开系统文件选择器，文件内容仍只在当前浏览器标签页中读取。
function chooseFile() {
  inputRef.value?.click()
}

// 读取用户选择的单个文件并将内容交给上层表单决定是否覆盖。
async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  reading.value = true
  try {
    const payload = await readMarkdownFile(file)
    emit('imported', payload)
  }
  catch (error) {
    emit('error', error instanceof Error ? error.message : 'Markdown 文件读取失败')
  }
  finally {
    reading.value = false
    input.value = ''
  }
}
</script>

<template>
  <!-- 本地导入入口：隐藏 input 保留原生文件选择与键盘可达按钮。 -->
  <span class="markdown-import">
    <input
      ref="inputRef"
      class="markdown-import__input"
      type="file"
      accept=".md,.markdown,text/markdown"
      @change="handleFileChange"
    >
    <button
      type="button"
      class="markdown-import__button"
      :disabled="reading"
      @click="chooseFile"
    >
      <span
        class="i-carbon-document-import"
        aria-hidden="true"
      />
      {{ reading ? '读取中…' : '导入 Markdown' }}
    </button>
  </span>
</template>

<style scoped>
.markdown-import__input {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.markdown-import__button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius-sm);
  color: var(--ink-secondary);
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  transition: border-color var(--duration-fast), color var(--duration-fast), background var(--duration-fast);
}

.markdown-import__button:hover:not(:disabled) {
  border-color: var(--accent-terracotta);
  background: var(--paper-surface);
  color: var(--accent-terracotta);
}

.markdown-import__button:disabled {
  cursor: wait;
  opacity: 0.6;
}
</style>
