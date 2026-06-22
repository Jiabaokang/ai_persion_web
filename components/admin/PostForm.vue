<script setup lang="ts">
const props = defineProps<{ initial?: any, id?: number }>()

const form = reactive({
  type: props.initial?.type ?? 'blog',
  title: props.initial?.title ?? '',
  summary: props.initial?.summary ?? '',
  contentMd: props.initial?.contentMd ?? '',
  visibility: props.initial?.visibility ?? 'public',
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
  return { ...form, tagNames, tagNamesInput: undefined }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (props.id) {
      await $fetch(`/api/contents/${props.id}`, {
        method: 'PATCH', body: buildPayload(), credentials: 'include',
      })
    }
    else {
      await $fetch('/api/contents', {
        method: 'POST', body: buildPayload(), credentials: 'include',
      })
    }
    await navigateTo('/admin/posts')
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
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">类型</label>
        <select
          v-model="form.type"
          class="w-full px-3 py-2 border border-gray-300 rounded"
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
        <label class="block text-sm font-medium mb-1">可见性</label>
        <select
          v-model="form.visibility"
          class="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="public">
            公开
          </option>
          <option value="private">
            私密
          </option>
        </select>
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">标题</label>
      <Input
        v-model="form.title"
        name="title"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">摘要</label>
      <Input
        v-model="form.summary"
        name="summary"
        placeholder="（可选，用于列表和 SEO）"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">标签（逗号分隔）</label>
      <Input
        v-model="form.tagNamesInput"
        name="tags"
        placeholder="技术,生活"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">内容</label>
      <ClientOnly>
        <Editor
          v-model="form.contentMd"
          :type="form.type"
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
      > 草稿</label>
      <label class="text-sm"><input
        v-model="form.status"
        type="radio"
        value="published"
      > 发布</label>
    </div>
    <p
      v-if="error"
      class="text-red-500 text-sm"
    >
      {{ error }}
    </p>
    <div class="flex gap-2">
      <Button
        type="submit"
        :disabled="saving"
      >
        {{ saving ? '保存中…' : '保存' }}
      </Button>
      <NuxtLink
        to="/admin/posts"
        class="px-4 py-2 border border-gray-300 rounded"
      >取消</NuxtLink>
    </div>
  </form>
</template>
