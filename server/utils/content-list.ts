interface ContentTagRow {
  contentId: number
  id: number
  name: string
  slug: string
  color: string | null
}

// 将一次批量关联查询整理为列表 DTO，避免按内容逐条查询标签。
export function attachTagsToContents<T extends { id: number }>(
  contentRows: T[],
  tagRows: ContentTagRow[],
) {
  const tagsByContent = new Map<number, Array<Omit<ContentTagRow, 'contentId'>>>()

  for (const { contentId, ...tag } of tagRows) {
    const contentTagList = tagsByContent.get(contentId) ?? []
    contentTagList.push(tag)
    tagsByContent.set(contentId, contentTagList)
  }

  return contentRows.map(content => ({
    ...content,
    tags: tagsByContent.get(content.id) ?? [],
  }))
}
