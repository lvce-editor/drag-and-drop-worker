import { dropCommandMap } from '../DropCommandMap/DropCommandMap.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  ...dropCommandMap,
  'DragAndDrop.handleMessagePort': handleMessagePort,
}
