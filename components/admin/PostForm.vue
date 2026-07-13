<script setup lang="ts">
type ContentType = 'blog' | 'wechat' | 'note' | 'inspiration'
type Visibility = 'public' | 'private'
type Status = 'draft' | 'published'

const props = defineProps<{ initial?: any, id?: number }>()

const form = reactive({
  slug: props.initial?.slug ?? '',
  type: props.initial?.type ?? 'blog',
  title: props.initial?.title ?? '',
  summary: props.initial?.summary ?? '',
  contentMd: props.initial?.contentMd ?? '',
  visibility: props.initial?.visibility ?? (props.initial?.type === 'note' || props.initial?.type === 'inspiration' ? 'private' : 'public'),
  status: props.initial?.status ?? 'draft',
  coverImageUrl: props.initial?.coverImageUrl ?? '',
  tagNamesInput: props.initial?.tags?.map((tag: any) => tag.name).join(', ') ?? '',
})

const saving = ref(false)
const error = ref('')
const justSaved = ref(false)
const importMessage = ref('')
const importError = ref('')
const privateOnly = computed(() => form.type === 'note' || form.type === 'inspiration')
const isEdit = computed(() => Boolean(props.id))
const saveIcon = computed(() => saving.value ? 'i-carbon-progress-bar-round post-form__spin' : 'i-carbon-save')

watchEffect(() => {
  if (privateOnly.value) form.visibility = 'private'
})

// 将编辑表单整理为内容接口负载，并规范化标签与可选字段。
function buildPayload() {
  const tagNames = form.tagNamesInput
    .split(/[,，]/)
    .map((name: string) => name.trim())
    .filter(Boolean)

  return {
    slug: form.slug.trim() || undefined,
    type: form.type as ContentType,
    title: form.title.trim(),
    summary: form.summary.trim() || undefined,
    contentMd: form.contentMd,
    visibility: form.visibility as Visibility,
    status: form.status as Status,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    tagNames,
  }
}

// 保存现有内容或创建新内容；本地导入本身不会触发该请求。
async function save() {
  saving.value = true
  error.value = ''
  try {
    if (props.id) {
      await $fetch(`/api/contents/${props.id}`, {
        method: 'PATCH',
        body: buildPayload(),
        credentials: 'include',
      })
      justSaved.value = true
      setTimeout(() => {
        justSaved.value = false
      }, 1200)
    }
    else {
      const created = await $fetch<{ id: number }>('/api/contents', {
        method: 'POST',
        body: buildPayload(),
        credentials: 'include',
      })
      if (created?.id) await navigateTo(`/admin/posts/${created.id}`)
    }
  }
  catch (caught: any) {
    error.value = caught?.data?.statusMessage || '保存失败'
  }
  finally {
    saving.value = false
  }
}

// 将本地 Markdown 写入正文；已有内容必须明确确认后才能覆盖。
function applyImportedMarkdown(payload: { content: string, suggestedTitle: string }) {
  if (form.contentMd.trim() && !window.confirm('当前正文已有内容，是否用导入文件覆盖？')) return
  form.contentMd = payload.content
  if (!form.title.trim()) form.title = payload.suggestedTitle
  importError.value = ''
  importMessage.value = 'Markdown 已导入，请确认内容后保存'
}

// 将文件读取错误展示在编辑器附近，避免与接口保存错误混淆。
function handleImportError(message: string) {
  importMessage.value = ''
  importError.value = message
}

if (import.meta.client) {
  useEventListener(window, 'keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      if (!saving.value) void save()
    }
  })
}
</script>

<template>
  <!-- 内容写作表单：正文为主栏，发布设置为右侧粘性辅助栏。 -->
  <form
    class="post-form"
    @submit.prevent="save"
  >
    <header class="post-form__header">
      <div>
        <NuxtLink
          to="/admin/posts"
          class="post-form__back"
        >
          <span
            class="i-carbon-arrow-left"
            aria-hidden="true"
          />
          返回内容列表
        </NuxtLink>
        <p class="paper-kicker">
          Writing workspace
        </p>
        <h1>{{ isEdit ? '编辑内容' : '新建内容' }}</h1>
        <p>保存快捷键：Cmd / Ctrl + S</p>
      </div>
      <div class="post-form__header-actions">
        <NuxtLink to="/admin/posts">取消</NuxtLink>
        <button
          type="submit"
          :disabled="saving"
        >
          <span
            :class="saveIcon"
            aria-hidden="true"
          />
          {{ saving ? '保存中…' : '保存内容' }}
        </button>
      </div>
    </header>

    <div class="post-form__layout">
      <section class="post-form__main">
        <div class="post-panel post-fields">
          <div class="post-fields__row">
            <label class="post-field">
              <span>标题</span>
              <UiInput
                v-model="form.title"
                name="title"
                placeholder="给它一个有辨识度的标题"
                class="post-field__control"
              />
            </label>
            <label class="post-field">
              <span>Slug（可选）</span>
              <UiInput
                v-model="form.slug"
                name="slug"
                placeholder="留空则自动生成"
                class="post-field__control is-mono"
              />
            </label>
          </div>
          <label class="post-field">
            <span>摘要（可选）</span>
            <UiInput
              v-model="form.summary"
              name="summary"
              placeholder="用于列表与 SEO 的一句话摘要"
              class="post-field__control"
            />
          </label>
          <label class="post-field">
            <span>标签（逗号分隔）</span>
            <UiInput
              v-model="form.tagNamesInput"
              name="tags"
              placeholder="技术, 生活"
              class="post-field__control"
            />
          </label>
        </div>

        <div class="post-panel post-editor-panel">
          <header>
            <div><strong>正文内容</strong><small>Markdown source</small></div>
            <span>支持本地 .md / .markdown</span>
          </header>
          <ClientOnly>
            <ContentMarkdownEditor v-model="form.contentMd">
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
                class="post-editor-fallback"
                placeholder="开始写作……"
              />
            </template>
          </ClientOnly>
          <p
            v-if="importError"
            class="post-message is-error"
            role="alert"
          >
            {{ importError }}
          </p>
          <p
            v-else-if="importMessage"
            class="post-message is-success"
            role="status"
          >
            {{ importMessage }}
          </p>
        </div>
      </section>

      <aside class="post-form__aside">
        <div class="post-settings is-sticky">
          <header>
            <p class="paper-kicker">
              Publishing
            </p>
            <h2>发布设置</h2>
          </header>

          <label class="post-field">
            <span>内容类型</span>
            <select
              v-model="form.type"
              class="post-field__control"
            >
              <option value="blog">博客</option>
              <option value="wechat">公众号</option>
              <option value="note">笔记（私密）</option>
              <option value="inspiration">灵感（私密）</option>
            </select>
          </label>

          <div class="post-field">
            <span>可见性</span>
            <div
              v-if="privateOnly"
              class="post-private-note"
            >
              <span
                class="i-carbon-locked"
                aria-hidden="true"
              />
              该类型固定为私密
            </div>
            <select
              v-else
              v-model="form.visibility"
              class="post-field__control"
            >
              <option value="public">
                公开
              </option>
              <option value="private">
                私密
              </option>
            </select>
          </div>

          <fieldset class="post-status">
            <legend>发布状态</legend>
            <button
              type="button"
              :class="{ 'is-active': form.status === 'draft' }"
              @click="form.status = 'draft'"
            >
              <span
                class="i-carbon-edit-off"
                aria-hidden="true"
              />
              草稿
            </button>
            <button
              type="button"
              :class="{ 'is-active': form.status === 'published' }"
              @click="form.status = 'published'"
            >
              <span
                class="i-carbon-checkmark-outline"
                aria-hidden="true"
              />
              发布
            </button>
            <small>{{ form.status === 'published' ? '保存后立即按可见性生效' : '草稿不会出现在公开列表中' }}</small>
          </fieldset>

          <label class="post-field">
            <span>封面图 URL（可选）</span>
            <UiInput
              v-model="form.coverImageUrl"
              name="cover"
              placeholder="https://..."
              class="post-field__control is-mono"
            />
          </label>

          <p
            v-if="error"
            class="post-save-state is-error"
            role="alert"
          >
            <span
              class="i-carbon-warning-alt"
              aria-hidden="true"
            />
            {{ error }}
          </p>
          <p
            v-else-if="justSaved"
            class="post-save-state is-success"
            role="status"
          >
            <span
              class="i-carbon-checkmark"
              aria-hidden="true"
            />
            已保存
          </p>
        </div>
      </aside>
    </div>
  </form>
</template>

<style scoped>
.post-form { display: grid; gap: 34px; }
.post-form__header { display: flex; align-items: end; justify-content: space-between; gap: 30px; padding-bottom: 25px; border-bottom: 1px solid var(--rule-strong); }
.post-form__back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--ink-muted); font-size: 0.72rem; }
.post-form__header h1 { margin-top: 6px; font-size: clamp(2.7rem, 6vw, 4.8rem); font-weight: 500; letter-spacing: -0.05em; }
.post-form__header > div:first-child > p:last-child { margin: 8px 0 0; color: var(--ink-muted); font-size: 0.72rem; }
.post-form__header-actions { display: flex; align-items: center; gap: 14px; }
.post-form__header-actions > a { color: var(--ink-secondary); font-size: 0.76rem; }
.post-form__header-actions > button { display: inline-flex; min-height: 42px; align-items: center; gap: 8px; padding: 8px 15px; border: 1px solid var(--accent-terracotta-dark); border-radius: var(--radius-sm); background: var(--accent-terracotta); color: var(--paper-surface); font-weight: 700; }
.post-form__header-actions > button:disabled { cursor: wait; opacity: 0.6; }
.post-form__layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 330px); gap: clamp(24px, 4vw, 44px); align-items: start; }
.post-form__main { display: grid; gap: 24px; min-width: 0; }
.post-panel { min-width: 0; border: 1px solid var(--rule-strong); border-radius: var(--radius-md); background: rgba(248, 242, 231, 0.68); }
.post-fields { display: grid; gap: 18px; padding: clamp(18px, 3vw, 28px); }
.post-fields__row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.post-field { display: grid; gap: 8px; color: var(--ink-secondary); font-size: 0.76rem; font-weight: 650; }
.post-field__control,
.post-editor-fallback { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule-strong); border-radius: var(--radius-sm); outline: 0; background: var(--paper-surface); color: var(--ink-primary); font: inherit; }
.post-field__control:focus,
.post-editor-fallback:focus { border-color: var(--accent-terracotta); box-shadow: 0 0 0 3px var(--focus-ring); }
.post-field__control.is-mono { font-family: var(--font-mono); font-size: 0.72rem; }
.post-editor-panel { padding: 12px; }
.post-editor-panel > header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 5px 6px 16px; }
.post-editor-panel > header > div { display: grid; }
.post-editor-panel > header small,
.post-editor-panel > header > span { color: var(--ink-muted); font-size: 0.64rem; }
.post-editor-fallback { min-height: 500px; resize: vertical; font-family: var(--font-mono); }
.post-message { margin: 10px 4px 0; font-size: 0.74rem; }
.post-message.is-error,
.post-save-state.is-error { color: var(--accent-terracotta-dark); }
.post-message.is-success,
.post-save-state.is-success { color: var(--accent-moss); }
.post-settings { display: grid; gap: 22px; padding: 22px; border: 1px solid var(--rule-strong); border-radius: var(--radius-md); background: rgba(248, 242, 231, 0.86); }
.post-settings.is-sticky { position: sticky; top: 92px; }
.post-settings > header { padding-bottom: 14px; border-bottom: 1px solid var(--rule-color); }
.post-settings h2 { margin-top: 4px; font-size: 1.35rem; }
.post-private-note { display: flex; min-height: 42px; align-items: center; gap: 8px; padding: 9px 11px; border: 1px solid var(--rule-color); border-radius: var(--radius-sm); background: var(--paper-muted); color: var(--ink-secondary); }
.post-status { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin: 0; padding: 0; border: 0; }
.post-status legend { grid-column: 1 / -1; margin-bottom: 6px; color: var(--ink-secondary); font-size: 0.76rem; font-weight: 650; }
.post-status button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; border: 1px solid var(--rule-color); border-radius: var(--radius-sm); color: var(--ink-secondary); font-size: 0.75rem; }
.post-status button.is-active { border-color: var(--accent-moss); background: var(--accent-moss-soft); color: #4f5e3e; }
.post-status small { grid-column: 1 / -1; margin-top: 4px; color: var(--ink-muted); font-size: 0.64rem; line-height: 1.5; }
.post-save-state { display: flex; align-items: center; gap: 8px; margin: 0; padding-top: 14px; border-top: 1px solid var(--rule-color); font-size: 0.75rem; }
.post-form__spin { animation: post-spin 0.9s linear infinite; }
@keyframes post-spin { to { transform: rotate(360deg); } }
@media (max-width: 1020px) {
  .post-form__layout { grid-template-columns: 1fr; }
  .post-form__aside { order: -1; }
  .post-settings.is-sticky { position: static; }
}
@media (max-width: 620px) {
  .post-form__header { align-items: start; flex-direction: column; }
  .post-form__aside { order: initial; }
  .post-fields__row { grid-template-columns: 1fr; }
}
</style>
