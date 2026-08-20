import { PlainMessagePortRpc } from '@lvce-editor/rpc'
import { dropCommandMap } from '../DropCommandMap/DropCommandMap.ts'

export const handleMessagePort = async (port: MessagePort): Promise<void> => {
  await PlainMessagePortRpc.create({
    commandMap: dropCommandMap,
    isMessagePortOpen: true,
    messagePort: port,
  })
}
