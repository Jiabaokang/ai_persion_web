export interface MarkdownImportResult {
  content: string
  suggestedTitle: string
}

// 校验并读取本地 Markdown 文件，不执行上传或持久化。
export async function readMarkdownFile(file: File): Promise<MarkdownImportResult> {
  if (!/\.(md|markdown)$/i.test(file.name)) {
    throw new Error('仅支持 .md 或 .markdown 文件')
  }

  const content = await file.text()
  if (!content.trim()) {
    throw new Error('Markdown 文件为空')
  }

  return {
    content,
    suggestedTitle: file.name.replace(/\.(md|markdown)$/i, ''),
  }
}
