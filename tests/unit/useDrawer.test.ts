import { effectScope, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { useDrawer } from '../../composables/useDrawer'

describe('useDrawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('Esc 关闭抽屉、归还焦点并在作用域结束后卸载监听', async () => {
    const trigger = document.createElement('button')
    trigger.dataset.menuToggle = ''
    document.body.append(trigger)

    const scope = effectScope()
    const drawer = scope.run(() => useDrawer())!
    drawer.open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(drawer.isOpen.value).toBe(false)
    expect(document.activeElement).toBe(trigger)

    drawer.open()
    scope.stop()
    expect(drawer.isOpen.value).toBe(false)
    expect(document.body.style.overflow).toBe('')

    drawer.open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(drawer.isOpen.value).toBe(true)
    drawer.close()
  })
})
