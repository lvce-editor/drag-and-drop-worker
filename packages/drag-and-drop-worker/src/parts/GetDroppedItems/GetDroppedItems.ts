import { RendererProcess } from '@lvce-editor/rpc-registry'
import type { DroppedItem } from '../DroppedItem/DroppedItem.ts'
import type { DroppedItems } from '../DroppedItems/DroppedItems.ts'
import { resolveDroppedItems } from '../ResolveDroppedItems/ResolveDroppedItems.ts'

export const getDroppedItems = async (itemIds: readonly number[], isElectron: boolean): Promise<DroppedItems> => {
  if (itemIds.length === 0) {
    return { files: [], strings: [], uris: [] }
  }
  const items = (await RendererProcess.invoke('FileSystemHandle.getFileHandles', itemIds)) as readonly DroppedItem[]
  return resolveDroppedItems(items, itemIds, Date.now(), isElectron)
}
