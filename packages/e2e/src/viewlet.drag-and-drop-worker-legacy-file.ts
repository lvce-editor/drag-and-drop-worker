import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.drag-and-drop-worker-legacy-file'

export const skip = ['webkit'] as const

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main }) => {
  const content = 'legacy file dropped from Firefox'
  const file = new File([content], 'legacy-dropped.txt', { type: 'text/plain' })
  const itemId = await FileSystem.registerFileHandle({ kind: 'file-legacy', type: file.type, value: file } as any)
  await Main.closeAllEditors()

  await Command.execute('Main.handleDrop', [itemId])

  const tab = Locator('.MainTab[title$="legacy-dropped.txt"]')
  const editor = Locator('.Editor')
  await expect(tab).toBeVisible()
  await expect(editor).toBeVisible()
  await Editor.shouldHaveText(content)
}
