<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

const props = defineProps<{ modelValue: string, type?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: { class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4' },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

const showSource = ref(false)
const sourceContent = ref(props.modelValue)

function toggleSource() {
  showSource.value = !showSource.value
  if (showSource.value) {
    sourceContent.value = props.modelValue
  }
}

function updateFromSource() {
  showSource.value = false
  if (editor.value) {
    editor.value.commands.setContent(sourceContent.value)
  }
}
</script>

<template>
  <div class="border border-gray-300 rounded">
    <div
      v-if="editor && !showSource"
      class="border-b border-gray-200 p-2 flex gap-1"
    >
      <button
        type="button"
        class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        class="px-2 py-1 text-sm italic hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        I
      </button>
      <button
        type="button"
        class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        •
      </button>
      <button
        type="button"
        class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        :class="{ 'bg-gray-200': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        { }
      </button>
      <span class="flex-1" />
      <button
        type="button"
        class="px-2 py-1 text-sm hover:bg-gray-100 rounded"
        @click="toggleSource"
      >
        &lt;/&gt;
      </button>
    </div>
    <div v-if="showSource">
      <textarea
        v-model="sourceContent"
        class="w-full p-4 font-mono text-sm min-h-[300px] focus:outline-none"
        @blur="updateFromSource"
      />
    </div>
    <EditorContent
      v-else
      :editor="editor"
    />
  </div>
</template>
