import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.drag-and-drop-worker-native-directory'

export const skip = ['webkit'] as const

export const test: Test = async ({ DragAndDrop, expect, Explorer, Locator, Workspace }) => {
  await Workspace.setPath('')
  const opfsRoot = await navigator.storage.getDirectory()
  const directoryHandle = await opfsRoot.getDirectoryHandle('native-workspace', { create: true })
  const nestedFileHandle = await directoryHandle.getFileHandle('inside.txt', { create: true })
  const writable = await nestedFileHandle.createWritable({ keepExistingData: false })
  await writable.write('inside')
  await writable.close()
  const dropId = await DragAndDrop.createDropSession([{ fileSystemHandle: directoryHandle, kind: 'file', type: '' }])

  await Explorer.handleDrop(5000, 5000, dropId)

  const welcomeMessage = Locator('.Explorer .WelcomeMessage')
  const nestedFile = Locator('.TreeItem[aria-label="inside.txt"]')
  await expect(welcomeMessage).toBeHidden()
  await expect(nestedFile).toBeVisible()
}
