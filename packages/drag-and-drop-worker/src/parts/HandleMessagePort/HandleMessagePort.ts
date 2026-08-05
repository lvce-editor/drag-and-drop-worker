import { PlainMessagePortRpc } from '@lvce-editor/rpc'
import { getDroppedItems } from '../GetDroppedItems/GetDroppedItems.ts'

const commandMap = {
  'DragAndDrop.getDroppedItems': getDroppedItems,
}

export const handleMessagePort = async (port: MessagePort): Promise<void> => {
  await PlainMessagePortRpc.create({
    commandMap,
    isMessagePortOpen: true,
    messagePort: port,
  })
}
