import { RendererProcess } from '@lvce-editor/rpc-registry'
import type { DroppedFileItemLike } from '../DroppedItem/DroppedItem.ts'
import type { DroppedFile } from '../DroppedItems/DroppedItems.ts'
import { getHandle } from '../GetHandle/GetHandle.ts'
import { getKind } from '../GetKind/GetKind.ts'
import { getName } from '../GetName/GetName.ts'
import { getNativeFile } from '../GetNativeFile/GetNativeFile.ts'

export const getBrowserDroppedFile = async (item: DroppedFileItemLike, itemId: number, dropId: number): Promise<DroppedFile> => {
  const handle = getHandle(item)
  const name = getName(item)
  if (!handle) {
    const nativeFile = getNativeFile(item)
    if (!nativeFile) {
      return { handle, kind: 'file', name, path: '', uri: '' }
    }
    const uri = `memfs:///dropped-files/${dropId}/${itemId}/${name}`
    await RendererProcess.invoke('FileSystem.writeFile', uri, await nativeFile.text())
    return { handle, kind: 'file', name, path: '', uri }
  }
  const kind = getKind(handle)
  const suffix = kind === 'directory' ? '/' : ''
  const uri = `html:///dropped-files/${dropId}/${itemId}/${name}${suffix}`
  await RendererProcess.invoke('PersistentFileHandle.addHandle', uri, handle)
  return { handle, kind, name, path: '', uri }
}
