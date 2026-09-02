import { discardDrop } from '../DiscardDrop/DiscardDrop.ts'
import { getDroppedFilesByDropId } from '../GetDroppedFilesByDropId/GetDroppedFilesByDropId.ts'
import { getDroppedItemsByDropId } from '../GetDroppedItemsByDropId/GetDroppedItemsByDropId.ts'
import { getDroppedUrisByDropId } from '../GetDroppedUrisByDropId/GetDroppedUrisByDropId.ts'
import { createTextDrag, discardTextDrag, takeTextDrag } from '../TextDragSessions/TextDragSessions.ts'

export const dropCommandMap = {
  'DragAndDrop.createTextDrag': createTextDrag,
  'DragAndDrop.discardDrop': discardDrop,
  'DragAndDrop.discardTextDrag': discardTextDrag,
  'DragAndDrop.getDroppedFilesByDropId': getDroppedFilesByDropId,
  'DragAndDrop.getDroppedItemsByDropId': getDroppedItemsByDropId,
  'DragAndDrop.getDroppedUrisByDropId': getDroppedUrisByDropId,
  'DragAndDrop.takeTextDrag': takeTextDrag,
}
