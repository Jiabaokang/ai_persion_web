import { describe, expect, it } from 'vitest'
import { buildRelatedEntries, extractHeadingOutline } from '../../../utils/reading-aside'

describe('详情阅读索引', () => {
  it('从安全 HTML 中提取二三级标题目录', () => {
    const html = '<h1 id="top">标题</h1><h2 id="part-a">第一节</h2><p>正文</p><h3 id="detail">细节 <code>A</code></h3>'
    expect(extractHeadingOutline(html)).toEqual([
      { id: 'part-a', level: 2, text: '第一节' },
      { id: 'detail', level: 3, text: '细节 A' },
    ])
  })

  it('优先返回同类型且不是当前文章的相关内容', () => {
    const entries = [
      { id: 1, type: 'blog', title: '当前' },
      { id: 2, type: 'note', title: '笔记' },
      { id: 3, type: 'blog', title: '相关一' },
      { id: 4, type: 'blog', title: '相关二' },
      { id: 5, type: 'blog', title: '相关三' },
      { id: 6, type: 'blog', title: '不展示' },
    ]
    expect(buildRelatedEntries(entries, entries[0]).map(item => item.id)).toEqual([3, 4, 5])
  })
})
