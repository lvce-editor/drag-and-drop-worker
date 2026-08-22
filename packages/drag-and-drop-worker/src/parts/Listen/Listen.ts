import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import { RendererProcess } from '@lvce-editor/rpc-registry'
import { commandMap } from '../CommandMap/CommandMap.ts'

export const listen = async (): Promise<void> => {
  const rpc = await WebWorkerRpcClient.create({
    commandMap,
  })
  RendererProcess.set(rpc)
}
