import { discardDrop } from '../DiscardDrop/DiscardDrop.ts'
import { getDroppedFileHandlesByDropId } from '../GetDroppedFileHandlesByDropId/GetDroppedFileHandlesByDropId.ts'
import { getDroppedItems } from '../GetDroppedItems/GetDroppedItems.ts'
import { getDroppedItemsByDropId } from '../GetDroppedItemsByDropId/GetDroppedItemsByDropId.ts'
import { getDroppedUrisByDropId } from '../GetDroppedUrisByDropId/GetDroppedUrisByDropId.ts'
import { createTextDrag, discardTextDrag, takeTextDrag } from '../TextDragSessions/TextDragSessions.ts'

export const dropCommandMap = {
  'DragAndDrop.createTextDrag': createTextDrag,
  'DragAndDrop.discardDrop': discardDrop,
  'DragAndDrop.discardTextDrag': discardTextDrag,
  'DragAndDrop.getDroppedFileHandlesByDropId': getDroppedFileHandlesByDropId,
  'DragAndDrop.getDroppedItems': getDroppedItems,
  'DragAndDrop.getDroppedItemsByDropId': getDroppedItemsByDropId,
  'DragAndDrop.getDroppedUrisByDropId': getDroppedUrisByDropId,
  'DragAndDrop.takeTextDrag': takeTextDrag,
}
