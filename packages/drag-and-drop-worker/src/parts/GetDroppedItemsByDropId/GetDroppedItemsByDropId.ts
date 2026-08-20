import type { DroppedItem } from '../DroppedItem/DroppedItem.ts'
import type { DroppedItems } from '../DroppedItems/DroppedItems.ts'
import { getDropData, type DropDataItem } from '../DropData/DropData.ts'
import { resolveDroppedItems } from '../ResolveDroppedItems/ResolveDroppedItems.ts'

const toDroppedItem = (item: DropDataItem): DroppedItem => {
  if (item.kind === 'string') {
    return item
  }
  if (item.fileSystemHandle) {
    return {
      ...(item.file && { file: item.file }),
      kind: 'file',
      ...(item.electronFilePath && { path: item.electronFilePath }),
      type: item.type,
      value: item.fileSystemHandle,
    }
  }
  return {
    kind: 'file-legacy',
    ...(item.electronFilePath && { path: item.electronFilePath }),
    type: item.type,
    value: item.file as File,
  }
}

export const getDroppedItemsByDropId = async (dropId: number, isElectron: boolean): Promise<DroppedItems> => {
  const items = await getDropData(dropId, {
    formats: ['string', 'file', 'fileSystemHandle'],
    includeElectronFilePaths: isElectron,
  })
  const itemIds = items.map((item) => item.index)
  return resolveDroppedItems(items.map(toDroppedItem), itemIds, dropId, isElectron)
}
