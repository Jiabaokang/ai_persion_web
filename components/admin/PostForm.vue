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
  tagNamesInput: props.initial?.tags?.map((t: any) => t.name).join(', ') ?? '',
})

const saving = ref(false)
const error = ref('')
const justSaved = ref(false)

const privateOnly = computed(() => form.type === 'note' || form.type === 'inspiration')
const isEdit = computed(() => Boolean(props.id))
const saveIcon = computed(() => saving.value ? 'i-carbon-progress-bar-round animate-spin' : 'i-carbon-save')

watchEffect(() => {
  if (privateOnly.value) form.visibility = 'private'
})

function buildPayload() {
  const tagNames = form.tagNamesInput
    .split(/[,，]/)
    .map((s: string) => s.trim())
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

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (props.id) {
      await $fetch(`/api/contents/${props.id}`, {
        method: 'PATCH', body: buildPayload(), credentials: 'include',
      })
      justSaved.value = true
      setTimeout(() => { justSaved.value = false }, 1200)
    }
    else {
      const created = await $fetch<{ id: number }>('/api/contents', {
        method: 'POST', body: buildPayload(), credentials: 'include',
      })
      if (created?.id) {
        await navigateTo(`/admin/posts/${created.id}`)
        return
      }
    }
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || '保存失败'
  }
  finally {
    saving.value = false
  }
}

if (process.client) {
  useEventListener(window, 'keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      if (!saving.value) void save()
    }
  })
}

const inputBase = 'w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition'
const inputFocus = 'focus:border-[rgba(34,211,238,0.55)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]'
const inputClass = `${inputBase} ${inputFocus}`

function statusPillClass(value: Status) {
  const base = 'w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-800 border transition'
  if (form.status === value) {
    return `${base} bg-[var(--gradient-aurora-soft)] border-[rgba(255,255,255,0.16)] text-[var(--text-primary)]`
  }
  return `${base} bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.10)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--text-primary)]`
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div class="min-w-60">
        <NuxtLink
          to="/admin/posts"
          class="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          <span class="i-carbon-arrow-left w-4 h-4" />
          返回列表
        </NuxtLink>
        <h2 class="mt-3 text-2xl md:text-3xl font-900 tracking--0.3">
          <span class="gradient-text">{{ isEdit ? '编辑内容' : '新建内容' }}</span>
        </h2>
        <div class="mt-1 text-sm text-[var(--text-muted)]">
          结构化字段 + 编辑器，发布前一眼确认元信息
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--gradient-aurora)] text-white font-900 shadow-[var(--shadow-glow-cyan)] hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="saving"
        >
          <span
            class="w-5 h-5"
            :class="saveIcon"
          />
          <span>{{ saving ? '保存中…' : '保存' }}</span>
        </button>
        <NuxtLink
          to="/admin/posts"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] transition"
        >
          取消
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <section class="lg:col-span-8 space-y-5">
        <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] p-4 md:p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-700 text-[var(--text-secondary)]">
                标题
              </div>
              <UiInput
                v-model="form.title"
                name="title"
                placeholder="给它一个有辨识度的标题"
                :class="`mt-2 ${inputClass}`"
              />
            </div>
            <div>
              <div class="text-sm font-700 text-[var(--text-secondary)]">
                Slug（可选）
              </div>
              <UiInput
                v-model="form.slug"
                name="slug"
                placeholder="留空则自动生成"
                :class="`mt-2 ${inputClass} font-mono`"
              />
            </div>
          </div>

          <div class="mt-4">
            <div class="text-sm font-700 text-[var(--text-secondary)]">
              摘要（可选）
            </div>
            <UiInput
              v-model="form.summary"
              name="summary"
              placeholder="用于列表与 SEO 的一句话摘要"
              :class="`mt-2 ${inputClass}`"
            />
          </div>

          <div class="mt-4">
            <div class="text-sm font-700 text-[var(--text-secondary)]">
              标签（逗号分隔）
            </div>
            <UiInput
              v-model="form.tagNamesInput"
              name="tags"
              placeholder="技术,生活"
              :class="`mt-2 ${inputClass}`"
            />
          </div>
        </div>

        <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
          <div class="px-4 md:px-5 py-3 border-b border-[rgba(255,255,255,0.10)] flex items-center justify-between gap-3">
            <div class="text-sm font-800 text-[var(--text-secondary)]">
              正文内容
            </div>
            <div class="text-xs text-[var(--text-muted)] font-mono">
              Cmd/Ctrl + S 保存
            </div>
          </div>
          <div class="p-2 md:p-3">
            <ClientOnly>
              <ContentEditor
                v-model="form.contentMd"
                :type="form.type"
              />
              <template #fallback>
                <textarea
                  v-model="form.contentMd"
                  :class="`min-h-[420px] ${inputClass} font-mono text-sm`"
                  placeholder="开始写作…"
                />
              </template>
            </ClientOnly>
          </div>
        </div>
      </section>

      <aside class="lg:col-span-4">
        <div class="lg:sticky lg:top-28 space-y-5">
          <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] p-4 md:p-5">
            <div class="text-sm font-800 text-[var(--text-secondary)]">
              发布设置
            </div>

            <div class="mt-4 grid grid-cols-1 gap-4">
              <div>
                <div class="text-sm font-700 text-[var(--text-secondary)]">
                  类型
                </div>
                <select
                  v-model="form.type"
                  :class="`mt-2 ${inputClass}`"
                >
                  <option value="blog">
                    博客
                  </option>
                  <option value="wechat">
                    公众号
                  </option>
                  <option value="note">
                    笔记（私密）
                  </option>
                  <option value="inspiration">
                    灵感（私密）
                  </option>
                </select>
              </div>

              <div>
                <div class="text-sm font-700 text-[var(--text-secondary)]">
                  可见性
                </div>
                <div
                  v-if="privateOnly"
                  class="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.10)] text-sm text-[var(--text-secondary)]"
                >
                  <span class="i-carbon-locked w-4 h-4" />
                  该类型固定为私密
                </div>
                <select
                  v-else
                  v-model="form.visibility"
                  :class="`mt-2 ${inputClass}`"
                >
                  <option value="public">
                    公开
                  </option>
                  <option value="private">
                    私密
                  </option>
                </select>
              </div>

              <div>
                <div class="text-sm font-700 text-[var(--text-secondary)]">
                  状态
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    :class="statusPillClass('draft')"
                    @click="form.status = 'draft'"
                  >
                    <span class="i-carbon-edit-off w-4 h-4" />
                    草稿
                  </button>
                  <button
                    type="button"
                    :class="statusPillClass('published')"
                    @click="form.status = 'published'"
                  >
                    <span class="i-carbon-checkmark-outline w-4 h-4" />
                    发布
                  </button>
                </div>
                <div
                  class="mt-2 text-xs"
                  :class="form.status === 'published' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'"
                >
                  {{ form.status === 'published' ? '发布后将对外可见（若可见性为公开）' : '草稿不会出现在公开列表中' }}
                </div>
              </div>

              <div>
                <div class="text-sm font-700 text-[var(--text-secondary)]">
                  封面图（可选）
                </div>
                <UiInput
                  v-model="form.coverImageUrl"
                  name="cover"
                  placeholder="https://..."
                  :class="`mt-2 ${inputClass} font-mono`"
                />
              </div>
            </div>
          </div>

          <div
            v-if="error"
            class="rounded-2xl border border-[rgba(236,72,153,0.30)] bg-[rgba(236,72,153,0.10)] p-4 text-sm"
          >
            <div class="flex items-start gap-2">
              <span class="i-carbon-warning-alt w-5 h-5 text-[var(--accent-pink)]" />
              <div class="min-w-0">
                <div class="font-800 text-[var(--text-primary)]">
                  保存失败
                </div>
                <div class="mt-1 text-[var(--text-secondary)] break-words">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-else-if="justSaved"
            class="rounded-2xl border border-[rgba(34,211,238,0.28)] bg-[rgba(34,211,238,0.10)] p-4 text-sm"
          >
            <div class="flex items-center gap-2 text-[var(--text-primary)] font-800">
              <span class="i-carbon-checkmark w-5 h-5 text-[var(--accent-cyan)]" />
              已保存
            </div>
          </div>
        </div>
      </aside>
    </div>
  </form>
</template>
