import { discardDrop } from '../DiscardDrop/DiscardDrop.ts'
import { getDroppedFileHandlesByDropId } from '../GetDroppedFileHandlesByDropId/GetDroppedFileHandlesByDropId.ts'
import { getDroppedItems } from '../GetDroppedItems/GetDroppedItems.ts'
import { getDroppedItemsByDropId } from '../GetDroppedItemsByDropId/GetDroppedItemsByDropId.ts'
import { getDroppedUrisByDropId } from '../GetDroppedUrisByDropId/GetDroppedUrisByDropId.ts'

export const dropCommandMap = {
  'DragAndDrop.discardDrop': discardDrop,
  'DragAndDrop.getDroppedFileHandlesByDropId': getDroppedFileHandlesByDropId,
  'DragAndDrop.getDroppedItems': getDroppedItems,
  'DragAndDrop.getDroppedItemsByDropId': getDroppedItemsByDropId,
  'DragAndDrop.getDroppedUrisByDropId': getDroppedUrisByDropId,
}
