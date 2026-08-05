import type { DroppedFileItemLike } from '../DroppedItem/DroppedItem.ts'
import { getHandle } from '../GetHandle/GetHandle.ts'
import { getNativeFile } from '../GetNativeFile/GetNativeFile.ts'

export const getName = (item: DroppedFileItemLike): string => {
  const handle = getHandle(item)
  return handle?.name || getNativeFile(item)?.name || ''
}
