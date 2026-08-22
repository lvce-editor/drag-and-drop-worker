import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.drag-and-drop-worker-uri-list'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const first = `${tmpDir}/first-dropped.txt`
  const second = `${tmpDir}/second-dropped.txt`
  await FileSystem.setFiles([
    { content: 'first', uri: first },
    { content: 'second', uri: second },
  ])
  await Workspace.setPath(tmpDir)
  await Main.closeAllEditors()
  const itemId = await FileSystem.registerFileHandle({
    kind: 'string',
    type: 'text/uri-list',
    value: `# ignored\r\n${first}\n${second}`,
  } as any)

  await Command.execute('Main.handleDrop', [itemId])

  const tabs = Locator('.MainTab')
  const firstTab = Locator('.MainTab[title$="first-dropped.txt"]')
  const secondTab = Locator('.MainTab[title$="second-dropped.txt"]')
  await expect(tabs).toHaveCount(2)
  await expect(firstTab).toBeVisible()
  await expect(secondTab).toBeVisible()
}
