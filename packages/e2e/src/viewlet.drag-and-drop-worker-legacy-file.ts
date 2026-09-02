import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.drag-and-drop-worker-legacy-file'

export const skip = ['webkit'] as const

export const test: Test = async ({ Command, DragAndDrop, Editor, expect, Locator, Main }) => {
  const content = 'legacy file dropped from Firefox'
  const file = new File([content], 'legacy-dropped.txt', { type: 'text/plain' })
  const dropId = await DragAndDrop.createDropSession([{ file, kind: 'file', type: file.type }])
  await Main.closeAllEditors()

  await Command.execute('Main.handleDrop', dropId)

  const tab = Locator('.MainTab[title$="legacy-dropped.txt"]')
  const editor = Locator('.Editor')
  await expect(tab).toBeVisible()
  await expect(editor).toBeVisible()
  await Editor.shouldHaveText(content)
}
