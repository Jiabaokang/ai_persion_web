<script setup lang="ts">
const props = defineProps<{ initial?: any, id?: number }>()

const form = reactive({
  title: props.initial?.title ?? '',
  summary: props.initial?.summary ?? '',
  contentMd: props.initial?.contentMd ?? '',
  status: props.initial?.status ?? 'draft',
  tagNamesInput: props.initial?.tags?.map((t: any) => t.name).join(', ') ?? '',
})

const saving = ref(false)
const error = ref('')
const importMessage = ref('')

// 将灵感表单整理为私密内容接口需要的负载。
function buildPayload() {
  const tagNames = form.tagNamesInput
    .split(/[,，]/)
    .map((s: string) => s.trim())
    .filter(Boolean)
  return {
    type: 'inspiration',
    visibility: 'private',
    title: form.title,
    summary: form.summary,
    contentMd: form.contentMd,
    status: form.status,
    tagNames,
  }
}

// 显式保存当前灵感，导入 Markdown 后仍由用户决定何时提交。
async function save() {
  saving.value = true
  error.value = ''
  try {
    const saved = props.id
      ? await $fetch(`/api/contents/${props.id}`, { method: 'PATCH', body: buildPayload(), credentials: 'include' })
      : await $fetch('/api/contents', { method: 'POST', body: buildPayload(), credentials: 'include' })
    await navigateTo(`/inspiration/${saved.slug}`)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || '保存失败'
  }
  finally {
    saving.value = false
  }
}

// 将本地 Markdown 应用到灵感正文，覆盖已有内容前必须确认。
function applyImportedMarkdown(payload: { content: string, suggestedTitle: string }) {
  if (form.contentMd.trim() && !window.confirm('当前正文已有内容，是否用导入文件覆盖？')) return

  form.contentMd = payload.content
  if (!form.title.trim()) form.title = payload.suggestedTitle
  error.value = ''
  importMessage.value = 'Markdown 已导入，请确认内容后保存'
}

// 将本地文件读取错误展示在表单内。
function handleImportError(message: string) {
  importMessage.value = ''
  error.value = message
}
</script>

<template>
  <!-- 灵感编辑表单：保留快速记录流程并复用统一 Markdown 工作台。 -->
  <form
    class="inspiration-form"
    @submit.prevent="save"
  >
    <div class="inspiration-form__grid">
      <label class="inspiration-field">
        <span>标题</span>
        <UiInput
          v-model="form.title"
          name="title"
          placeholder="一句话记下灵感"
          class="inspiration-field__control"
        />
      </label>
      <label class="inspiration-field">
        <span>摘要</span>
        <UiInput
          v-model="form.summary"
          name="summary"
          placeholder="（可选）"
          class="inspiration-field__control"
        />
      </label>
    </div>
    <label class="inspiration-field">
      <span>标签（逗号分隔）</span>
      <UiInput
        v-model="form.tagNamesInput"
        name="tags"
        placeholder="产品,交互,写作"
        class="inspiration-field__control"
      />
    </label>
    <div class="inspiration-field">
      <span>内容</span>
      <ClientOnly>
        <ContentMarkdownEditor
          v-model="form.contentMd"
        >
          <template #actions>
            <ContentImportMarkdownButton
              @imported="applyImportedMarkdown"
              @error="handleImportError"
            />
          </template>
        </ContentMarkdownEditor>
        <template #fallback>
          <textarea
            v-model="form.contentMd"
            class="inspiration-field__fallback"
            placeholder="支持 Markdown 语法"
          />
        </template>
      </ClientOnly>
      <p
        v-if="importMessage"
        class="mt-2 text-sm text-[var(--accent-moss)]"
        role="status"
      >
        {{ importMessage }}
      </p>
    </div>
    <fieldset class="inspiration-status">
      <legend>整理状态</legend>
      <label><input
        v-model="form.status"
        type="radio"
        value="draft"
      > 碎片</label>
      <label><input
        v-model="form.status"
        type="radio"
        value="published"
      > 已整理</label>
    </fieldset>
    <p
      v-if="error"
      class="inspiration-error"
      role="alert"
    >
      {{ error }}
    </p>
    <div class="inspiration-form__actions">
      <button
        type="submit"
        class="inspiration-save"
        :disabled="saving"
      >
        {{ saving ? '保存中…' : '保存灵感' }}
      </button>
      <NuxtLink
        to="/inspiration"
        class="inspiration-cancel"
      >
        取消
      </NuxtLink>
    </div>
  </form>
</template>

<style scoped>
.inspiration-form { display: grid; gap: 22px; }
.inspiration-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.inspiration-field { display: grid; gap: 8px; color: var(--ink-secondary); font-size: 0.8rem; font-weight: 650; }
.inspiration-field__control,
.inspiration-field__fallback {
  width: 100%; padding: 11px 13px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm);
  outline: 0; background: var(--paper-surface); color: var(--ink-primary); font: inherit;
}
.inspiration-field__fallback { min-height: 360px; font-family: var(--font-mono); }
.inspiration-field__control:focus,
.inspiration-field__fallback:focus { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.inspiration-status { display: flex; align-items: center; gap: 18px; margin: 0; padding: 16px 0; border: 0; border-top: 1px solid var(--rule-color); border-bottom: 1px solid var(--rule-color); color: var(--ink-secondary); font-size: 0.82rem; }
.inspiration-status legend { float: left; margin-right: auto; font-weight: 700; }
.inspiration-status label { display: inline-flex; align-items: center; gap: 6px; }
.inspiration-status input { accent-color: var(--accent-moss); }
.inspiration-error { margin: 0; color: var(--accent-terracotta-dark); font-size: 0.82rem; }
.inspiration-form__actions { display: flex; align-items: center; gap: 18px; }
.inspiration-save { min-height: 44px; padding: 9px 18px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-weight: 700; }
.inspiration-save:disabled { cursor: wait; opacity: 0.6; }
.inspiration-cancel { color: var(--ink-secondary); font-size: 0.85rem; }
.inspiration-cancel:hover { color: var(--accent-terracotta); }
@media (max-width: 640px) { .inspiration-form__grid { grid-template-columns: 1fr; } }
</style>
