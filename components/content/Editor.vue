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
    attributes: {
      class: 'min-h-[420px] p-4 md:p-5 outline-none text-[var(--text-primary)] leading-relaxed selection:bg-[rgba(34,211,238,0.22)] selection:text-[var(--text-primary)] [&_a]:text-[var(--accent-cyan)] [&_a]:underline [&_a]:underline-offset-4 [&_pre]:bg-[rgba(255,255,255,0.06)] [&_pre]:border [&_pre]:border-[rgba(255,255,255,0.10)] [&_pre]:rounded-2xl [&_pre]:p-4 [&_code]:font-mono',
    },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

const showSource = ref(false)
const sourceContent = ref(props.modelValue)

function toolBtnClass(active: boolean) {
  const base = 'w-9 h-9 rounded-xl inline-flex items-center justify-center text-sm transition border'
  if (active) return `${base} bg-[rgba(255,255,255,0.10)] border-[rgba(255,255,255,0.14)] text-[var(--text-primary)]`
  return `${base} bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]`
}

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
  <div class="rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] overflow-hidden">
    <div
      v-if="editor && !showSource"
      class="border-b border-[rgba(255,255,255,0.10)] px-3 py-2.5 flex items-center gap-1"
    >
      <button
        type="button"
        :class="toolBtnClass(editor.isActive('bold'))"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-800 tracking--0.2">
          B
        </span>
      </button>
      <button
        type="button"
        :class="toolBtnClass(editor.isActive('italic'))"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="font-800 italic tracking--0.2">
          I
        </span>
      </button>
      <button
        type="button"
        :class="toolBtnClass(editor.isActive('heading', { level: 2 }))"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <span class="font-800 text-xs tracking--0.2">
          H2
        </span>
      </button>
      <button
        type="button"
        :class="toolBtnClass(editor.isActive('bulletList'))"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <span class="font-900 text-base leading-none">
          •
        </span>
      </button>
      <button
        type="button"
        :class="toolBtnClass(editor.isActive('codeBlock'))"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <span class="font-800 text-xs font-mono">
          {'{ }'}
        </span>
      </button>
      <span class="flex-1" />
      <div class="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono mr-2">
        {{ showSource ? 'MD' : 'WYSIWYG' }}
      </div>
      <button
        type="button"
        :class="toolBtnClass(false)"
        @click="toggleSource"
      >
        <span class="font-800 text-xs font-mono">
          &lt;/&gt;
        </span>
      </button>
    </div>
    <div v-if="showSource">
      <textarea
        v-model="sourceContent"
        class="w-full px-4 py-4 font-mono text-sm min-h-[420px] outline-none text-[var(--text-primary)] bg-transparent"
        @blur="updateFromSource"
      />
    </div>
    <EditorContent
      v-else
      :editor="editor"
    />
  </div>
</template>
