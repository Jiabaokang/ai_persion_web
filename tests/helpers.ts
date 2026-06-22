// 测试公共 helper
//
// 提供 vitest 环境下的 Nuxt 兼容层：
//   - NuxtLink：stub 成 <a :href> + slot
//   - Teleport：stub 成 <div> 包裹（默认禁用 to="body" 的内容搬移）
//
// 用法：
//   import { nuxtStubs } from '../helpers'
//   mount(MyComponent, { global: { stubs: nuxtStubs, ... } })

import type { Component } from 'vue'

const NuxtLinkStub: Component = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : \'\'"><slot /></a>',
}

const TeleportStub: Component = {
  name: 'Teleport',
  template: '<div data-teleport-stub><slot /></div>',
}

export const nuxtStubs = {
  NuxtLink: NuxtLinkStub,
  Teleport: TeleportStub,
}
