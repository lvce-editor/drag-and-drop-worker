import type { DroppedFileItemLike } from '../DroppedItem/DroppedItem.ts'
import { isFileSystemHandle } from '../IsFileSystemHandle/IsFileSystemHandle.ts'

export const getNativeFile = (item: DroppedFileItemLike): File | undefined => {
  if (isFileSystemHandle(item)) {
    return undefined
  }
  if (item.kind === 'file-legacy') {
    return item.value
  }
  return item.file
}
