<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

type EditorMode = 'edit' | 'split' | 'preview'

const props = withDefaults(defineProps<{
  modelValue: string
  mode?: EditorMode
}>(), {
  mode: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const currentMode = ref<EditorMode>(props.mode ?? 'split')
const editorId = 'content-markdown-editor'
const toolbars = [
  'bold', 'italic', 'title', '-', 'quote', 'unorderedList', 'orderedList', 'task',
  'codeRow', 'code', 'link', 'image', 'table', '=', 'revoke', 'next', 'fullscreen',
] as const

const content = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

watch(() => props.mode, (mode) => {
  if (mode) currentMode.value = mode
})

// 小屏首次进入时优先保证输入空间，桌面则默认提供实时分屏预览。
onMounted(() => {
  if (!props.mode && window.matchMedia('(max-width: 720px)').matches) {
    currentMode.value = 'edit'
  }
})

// 切换编辑器工作区模式，不改变当前 Markdown 内容。
function setMode(mode: EditorMode) {
  currentMode.value = mode
}
</script>

<template>
  <!-- Markdown 工作台：模式控制独立于第三方工具栏，便于桌面与移动端使用。 -->
  <section
    class="markdown-editor"
    :data-mode="currentMode"
  >
    <div
      class="markdown-editor__bar"
      aria-label="Markdown 编辑模式"
    >
      <div class="markdown-editor__modes">
        <button
          v-for="item in ([['edit', '编辑'], ['split', '分屏'], ['preview', '预览']] as const)"
          :key="item[0]"
          type="button"
          class="markdown-editor__mode"
          :class="{ 'is-active': currentMode === item[0] }"
          :data-editor-mode="item[0]"
          :aria-pressed="currentMode === item[0]"
          @click="setMode(item[0])"
        >
          {{ item[1] }}
        </button>
      </div>
      <slot name="actions" />
    </div>

    <div class="markdown-editor__surface">
      <MdPreview
        v-if="currentMode === 'preview'"
        :id="`${editorId}-preview`"
        :model-value="content"
        language="zh-CN"
        theme="light"
        preview-theme="default"
        code-theme="github"
        class="markdown-editor__preview"
      />
      <MdEditor
        v-else
        :id="editorId"
        v-model="content"
        :preview="currentMode === 'split'"
        :toolbars="[...toolbars]"
        :footers="['markdownTotal', '=', 'scrollSwitch']"
        language="zh-CN"
        theme="light"
        preview-theme="default"
        code-theme="github"
        placeholder="从一个标题、片段或问题开始……"
        :no-mermaid="true"
        :no-katex="true"
        class="markdown-editor__vendor"
      />
    </div>
  </section>
</template>

<style scoped>
.markdown-editor {
  overflow: hidden;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius-md);
  background: var(--paper-surface);
}

.markdown-editor__bar {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--rule-color);
  background: var(--paper-muted);
}

.markdown-editor__modes {
  display: flex;
  align-items: center;
  gap: 2px;
}

.markdown-editor__mode {
  min-height: 34px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  color: var(--ink-muted);
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.08em;
}

.markdown-editor__mode:hover,
.markdown-editor__mode.is-active {
  background: var(--paper-surface);
  color: var(--ink-primary);
}

.markdown-editor__mode.is-active {
  box-shadow: inset 0 -2px 0 var(--accent-terracotta);
}

.markdown-editor__surface {
  min-height: 520px;
}

.markdown-editor__preview {
  min-height: 520px;
  padding: 26px clamp(18px, 4vw, 42px);
  background: var(--paper-surface);
}

:deep(.md-editor) {
  height: 520px;
  --md-bk-color: var(--paper-surface);
  --md-color: var(--ink-primary);
  --md-border-color: var(--rule-color);
  --md-scrollbar-bg-color: var(--paper-muted);
  --md-scrollbar-thumb-color: var(--paper-deep);
  --md-scrollbar-thumb-hover-color: var(--ink-muted);
}

:deep(.md-editor-toolbar-wrapper) {
  border-color: var(--rule-color);
  background: var(--paper-surface);
}

:deep(.md-editor-preview-wrapper) {
  background: var(--paper-surface);
}

/* 编辑模式保持第三方实例稳定，只收起预览列，避免异步挂载期间重建组件。 */
.markdown-editor[data-mode='edit'] :deep(.md-editor-content-wrapper > .md-editor-custom-scrollbar:first-child) {
  flex: 1 1 auto !important;
  width: 100% !important;
}

.markdown-editor[data-mode='edit'] :deep(.md-editor-content-wrapper > .md-editor-custom-scrollbar:last-child),
.markdown-editor[data-mode='edit'] :deep(.md-editor-resize-operate) {
  display: none !important;
}

@media (max-width: 720px) {
  .markdown-editor__bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .markdown-editor__surface,
  .markdown-editor__preview,
  :deep(.md-editor) {
    min-height: 460px;
    height: 460px;
  }
}
</style>
