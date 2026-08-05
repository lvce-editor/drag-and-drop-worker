import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { DroppedFile, DroppedItems } from '../DroppedItems/DroppedItems.ts'
import { parseUriList } from '../ParseUriList/ParseUriList.ts'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

interface DroppedStringItem {
  readonly kind: 'string'
  readonly type: string
  readonly value: string
}

interface DroppedFileItem {
  readonly file?: File
  readonly kind: 'file'
  readonly type: string
  readonly value: FileSystemHandle
}

interface DroppedLegacyFileItem {
  readonly kind: 'file-legacy'
  readonly type: string
  readonly value: File
}

type DroppedItem = DroppedFileItem | DroppedLegacyFileItem | DroppedStringItem

interface DragInfoItem {
  readonly data: string
  readonly type: string
}

interface DragInfo {
  readonly items: readonly DragInfoItem[]
}

const chromiumDragIdRegex = /^[A-F\d]{32}$/i

const isChromiumDragId = (item: DroppedStringItem): boolean => {
  return (item.type === '' || item.type === 'chromium/x-drag-id') && chromiumDragIdRegex.test(item.value)
}

const isFileSystemHandle = (value: unknown): value is FileSystemHandle => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<FileSystemHandle>
  return (candidate.kind === 'directory' || candidate.kind === 'file') && typeof candidate.name === 'string'
}

const getNativeFile = (item: DroppedFileItem | DroppedLegacyFileItem): File | undefined => {
  if (item.kind === 'file-legacy') {
    return item.value
  }
  return item.file
}

const getHandle = (item: DroppedFileItem | DroppedLegacyFileItem): FileSystemHandle | undefined => {
  return isFileSystemHandle(item.value) ? item.value : undefined
}

const getName = (item: DroppedFileItem | DroppedLegacyFileItem): string => {
  const handle = getHandle(item)
  return handle?.name || getNativeFile(item)?.name || ''
}

const getKind = (handle: FileSystemHandle | undefined): 'directory' | 'file' => {
  return handle?.kind === 'directory' ? 'directory' : 'file'
}

const getBrowserDroppedFile = async (item: DroppedFileItem | DroppedLegacyFileItem, itemId: number, dropId: number): Promise<DroppedFile> => {
  const handle = getHandle(item)
  const name = getName(item)
  if (!handle) {
    return { handle, kind: 'file', name, path: '', uri: '' }
  }
  const kind = getKind(handle)
  const suffix = kind === 'directory' ? '/' : ''
  const uri = `html:///dropped-files/${dropId}/${itemId}/${name}${suffix}`
  await RendererWorker.invoke('PersistentFileHandle.addHandle', uri, handle)
  return { handle, kind, name, path: '', uri }
}

const getElectronDroppedFile = async (item: DroppedFileItem | DroppedLegacyFileItem): Promise<DroppedFile> => {
  const handle = getHandle(item)
  const nativeFile = getNativeFile(item)
  const name = getName(item)
  if (!nativeFile) {
    return { handle, kind: getKind(handle), name, path: '', uri: '' }
  }
  const path = await RendererWorker.invoke('FileSystemHandle.getFilePathElectron', nativeFile)
  return { handle, kind: getKind(handle), name, path, uri: toFileUri(path) }
}

const getRetainedUris = async (): Promise<readonly string[]> => {
  const dragInfo = (await RendererWorker.invoke('Viewlet.getDragData')) as DragInfo | undefined
  if (!dragInfo || !Array.isArray(dragInfo.items)) {
    return []
  }
  const uris: string[] = []
  for (const item of dragInfo.items) {
    if (item.type === 'text/uri-list' && typeof item.data === 'string') {
      uris.push(...parseUriList(item.data))
    }
  }
  return uris
}

export const getDroppedItems = async (itemIds: readonly number[], isElectron: boolean): Promise<DroppedItems> => {
  if (itemIds.length === 0) {
    return { files: [], strings: [], uris: [] }
  }
  const items = (await RendererWorker.getFileHandles(itemIds)) as unknown as readonly DroppedItem[]
  const dropId = Date.now()
  const files: DroppedFile[] = []
  const strings: string[] = []
  const uris: string[] = []
  let hasChromiumDragId = false
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    if (item.kind === 'string') {
      if (item.type === 'text/uri-list') {
        uris.push(...parseUriList(item.value))
      } else if (isChromiumDragId(item)) {
        hasChromiumDragId = true
      } else {
        strings.push(item.value)
      }
      continue
    }
    const file = isElectron ? await getElectronDroppedFile(item) : await getBrowserDroppedFile(item, itemIds[index], dropId)
    files.push(file)
    if (file.uri) {
      uris.push(file.uri)
    }
  }
  if (uris.length === 0 && hasChromiumDragId) {
    uris.push(...(await getRetainedUris()))
  }
  return { files, strings, uris }
}
