import type { DroppedFileItemLike } from '../DroppedItem/DroppedItem.ts'
import { isFileSystemHandle } from '../IsFileSystemHandle/IsFileSystemHandle.ts'

export const getHandle = (item: DroppedFileItemLike): FileSystemHandle | undefined => {
  if (isFileSystemHandle(item)) {
    return item
  }
  return isFileSystemHandle(item.value) ? item.value : undefined
}
