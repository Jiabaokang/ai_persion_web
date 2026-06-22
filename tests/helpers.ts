// 测试公共 helper
//
// 提供 vitest 环境下的 Nuxt 兼容层：
//   - NuxtLink：stub 成 <a :href> + slot
//   - Teleport：stub 成 <div> 包裹（默认禁用 to="body" 的内容搬移）
//   - withSetup：在最小 Vue app 中调用 composable 并返回结果
//
// 用法：
//   import { nuxtStubs, withSetup } from '../helpers'
//   mount(MyComponent, { global: { stubs: nuxtStubs, ... } })
//   const result = withSetup(() => useTheme())

import { createApp } from 'vue'
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

/**
 * 在最小 Vue 实例中执行 composable，返回 setup 结果
 * 用于在 vitest 中测试无 template 的 composable 函数
 */
export function withSetup<T>(composable: () => T): T & { app: ReturnType<typeof createApp> } {
  let result!: T
  const app = createApp({
    setup() {
      result = composable()
      return () => null
    },
  })
  const el = document.createElement('div')
  document.body.appendChild(el)
  app.mount(el)
  ;(result as any).app = app
  return result as T & { app: ReturnType<typeof createApp> }
}
