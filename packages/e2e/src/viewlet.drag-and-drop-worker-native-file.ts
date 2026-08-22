import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.drag-and-drop-worker-native-file'

export const skip = ['webkit'] as const

export const test: Test = async ({ expect, Explorer, FileSystem, Locator, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/existing.txt`, 'existing')
  await Workspace.setPath(tmpDir)
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle('native-dropped.txt', { create: true })
  const writable = await fileHandle.createWritable({ keepExistingData: false })
  await writable.write('native file')
  await writable.close()
  const file = await fileHandle.getFile()
  const itemId = await FileSystem.registerFileHandle(fileHandle)

  await Explorer.handleDrop(0, 0, [itemId], [file])

  const droppedFile = Locator('.TreeItem[aria-label="native-dropped.txt"]')
  await expect(droppedFile).toBeVisible()
  await FileSystem.shouldHaveFile(`${tmpDir}/native-dropped.txt`, 'native file')
}
