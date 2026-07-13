import { describe, expect, it } from 'vitest'
import { attachTagsToContents } from '../../../server/utils/content-list'

describe('内容列表标签 DTO', () => {
  it('按内容 ID 批量附加标签并保留无标签内容', () => {
    const contents = [{ id: 1, title: '文章' }, { id: 2, title: '笔记' }]
    const tagRows = [
      { contentId: 1, id: 3, name: 'Markdown', slug: 'markdown', color: null },
      { contentId: 1, id: 4, name: '设计', slug: 'design', color: '#667653' },
    ]

    expect(attachTagsToContents(contents, tagRows)).toEqual([
      { ...contents[0], tags: tagRows.map(({ contentId: _contentId, ...tag }) => tag) },
      { ...contents[1], tags: [] },
    ])
  })
})
