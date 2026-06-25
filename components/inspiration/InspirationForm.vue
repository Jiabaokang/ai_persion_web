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
</script>

<template>
  <form
    class="space-y-4 bg-white p-6 rounded shadow"
    @submit.prevent="save"
  >
    <div>
      <label class="block text-sm font-medium mb-1">标题</label>
      <UiInput
        v-model="form.title"
        name="title"
        placeholder="一句话记下灵感"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">摘要</label>
      <UiInput
        v-model="form.summary"
        name="summary"
        placeholder="（可选）"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">标签（逗号分隔）</label>
      <UiInput
        v-model="form.tagNamesInput"
        name="tags"
        placeholder="产品,交互,写作"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">内容</label>
      <ClientOnly>
        <ContentEditor
          v-model="form.contentMd"
          type="inspiration"
        />
        <template #fallback>
          <textarea
            v-model="form.contentMd"
            class="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm min-h-[300px]"
            placeholder="支持 Markdown 语法"
          />
        </template>
      </ClientOnly>
    </div>
    <div class="flex items-center gap-4">
      <label class="text-sm"><input
        v-model="form.status"
        type="radio"
        value="draft"
      > 碎片</label>
      <label class="text-sm"><input
        v-model="form.status"
        type="radio"
        value="published"
      > 已整理</label>
    </div>
    <p
      v-if="error"
      class="text-red-500 text-sm"
    >
      {{ error }}
    </p>
    <div class="flex gap-2">
      <UiButton
        type="submit"
        :disabled="saving"
      >
        {{ saving ? '保存中…' : '保存' }}
      </UiButton>
      <NuxtLink
        to="/inspiration"
        class="px-4 py-2 border border-gray-300 rounded"
      >
        取消
      </NuxtLink>
    </div>
  </form>
</template>
