import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { RendererProcess } from '@lvce-editor/rpc-registry'

const mockRpc = {
  dispose: jest.fn(async () => {}),
  invoke: jest.fn(async (_method: string) => 'pong'),
}

const mockCreate = jest.fn(async (_options: unknown) => mockRpc)

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(async () => {
  await RendererProcess.dispose()
})

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  PlainMessagePortRpc: {
    create: jest.fn(),
  },
  WebWorkerRpcClient: {
    create: mockCreate,
  },
}))

const { listen } = await import('../src/parts/Listen/Listen.ts')

test('registers the parent connection as the renderer process', async () => {
  await listen()

  expect(mockCreate).toHaveBeenCalledWith({
    commandMap: expect.any(Object),
  })
  await expect(RendererProcess.invoke('ping')).resolves.toBe('pong')
  expect(mockRpc.invoke).toHaveBeenCalledWith('ping')
})
