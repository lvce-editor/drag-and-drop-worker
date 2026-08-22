import { RendererProcess } from '@lvce-editor/rpc-registry'
import type { DroppedFileItemLike } from '../DroppedItem/DroppedItem.ts'
import type { DroppedFile } from '../DroppedItems/DroppedItems.ts'
import { getHandle } from '../GetHandle/GetHandle.ts'
import { getKind } from '../GetKind/GetKind.ts'
import { getName } from '../GetName/GetName.ts'
import { getNativeFile } from '../GetNativeFile/GetNativeFile.ts'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

export const getElectronDroppedFile = async (item: DroppedFileItemLike): Promise<DroppedFile> => {
  const handle = getHandle(item)
  const nativeFile = getNativeFile(item)
  const name = getName(item)
  const retainedPath = 'path' in item ? item.path : undefined
  if (retainedPath) {
    return { handle, kind: getKind(handle), name, path: retainedPath, uri: toFileUri(retainedPath) }
  }
  if (!nativeFile) {
    return { handle, kind: getKind(handle), name, path: '', uri: '' }
  }
  const path = await RendererProcess.invoke('FileSystemHandle.getFilePathElectron', nativeFile)
  return { handle, kind: getKind(handle), name, path, uri: toFileUri(path) }
}
