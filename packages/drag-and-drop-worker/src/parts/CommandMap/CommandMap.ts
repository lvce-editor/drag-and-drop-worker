import { getDroppedItems } from '../GetDroppedItems/GetDroppedItems.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  'DragAndDrop.getDroppedItems': getDroppedItems,
  'DragAndDrop.handleMessagePort': handleMessagePort,
}
