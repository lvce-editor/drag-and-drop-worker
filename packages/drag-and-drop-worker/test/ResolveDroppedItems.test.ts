import { expect, test } from '@jest/globals'
import { registerMockRpc, RpcId } from '@lvce-editor/rpc-registry'
import type { DroppedItem } from '../src/parts/DroppedItem/DroppedItem.ts'
import type { DroppedItems } from '../src/parts/DroppedItems/DroppedItems.ts'
import { getNativeFile } from '../src/parts/GetNativeFile/GetNativeFile.ts'
import { isFileSystemHandle } from '../src/parts/IsFileSystemHandle/IsFileSystemHandle.ts'
import { resolveDroppedItems } from '../src/parts/ResolveDroppedItems/ResolveDroppedItems.ts'

const resolve = (items: readonly DroppedItem[], itemIds: readonly number[], isElectron = false): Promise<DroppedItems> => {
  return resolveDroppedItems(items, itemIds, 21, isElectron)
}

test('returns empty grouped data when nothing was dropped', async () => {
  await expect(resolve([], [])).resolves.toEqual({ files: [], strings: [], uris: [] })
})

test('recognizes only file system handle shaped values', () => {
  expect(isFileSystemHandle(undefined)).toBe(false)
  expect(isFileSystemHandle({ kind: 'file' })).toBe(false)
})

test('does not treat a raw file system handle as a native file', () => {
  expect(getNativeFile({ kind: 'file', name: 'notes.txt' } as FileSystemHandle)).toBeUndefined()
})

test('groups uri lists and strings', async () => {
  await expect(
    resolve(
      [
        { kind: 'string', type: 'text/uri-list', value: '# comment\nfile:///one\r\nfile:///two' },
        { kind: 'string', type: 'text/plain', value: 'plain text' },
      ],
      [1, 2],
    ),
  ).resolves.toEqual({ files: [], strings: ['plain text'], uris: ['file:///one', 'file:///two'] })
})

test('does not request retained data when a Chromium drag also contains a uri', async () => {
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'Viewlet.getDragData'() {
      throw new Error('retained data must not be requested')
    },
  })

  await expect(
    resolve(
      [
        { kind: 'string', type: 'chromium/x-drag-id', value: '8B1BC632EA890FDD4BDB7705EF0231B0' },
        { kind: 'string', type: 'text/uri-list', value: 'file:///workspace/notes.txt' },
      ],
      [1, 2],
    ),
  ).resolves.toEqual({ files: [], strings: [], uris: ['file:///workspace/notes.txt'] })
  expect(mockRpc.invocations).toEqual([])
})

test('persists browser file handles and returns html uris', async () => {
  const fileHandle = { kind: 'file', name: 'notes.txt' } as FileSystemFileHandle
  const directoryHandle = { kind: 'directory', name: 'src' } as FileSystemDirectoryHandle
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'PersistentFileHandle.addHandle'() {},
  })

  const result = await resolve(
    [
      { kind: 'file', type: 'text/plain', value: fileHandle },
      { kind: 'file', type: '', value: directoryHandle },
    ],
    [7, 9],
  )

  expect(result).toEqual({
    files: [
      { handle: fileHandle, kind: 'file', name: 'notes.txt', path: '', uri: 'html:///dropped-files/21/7/notes.txt' },
      { handle: directoryHandle, kind: 'directory', name: 'src', path: '', uri: 'html:///dropped-files/21/9/src/' },
    ],
    strings: [],
    uris: ['html:///dropped-files/21/7/notes.txt', 'html:///dropped-files/21/9/src/'],
  })
  expect(mockRpc.invocations).toEqual([
    ['PersistentFileHandle.addHandle', 'html:///dropped-files/21/7/notes.txt', fileHandle],
    ['PersistentFileHandle.addHandle', 'html:///dropped-files/21/9/src/', directoryHandle],
  ])
})

test('persists a raw browser file handle', async () => {
  const fileHandle = { kind: 'file', name: 'notes.txt' } as FileSystemFileHandle
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'PersistentFileHandle.addHandle'() {},
  })

  await expect(resolve([fileHandle], [7])).resolves.toEqual({
    files: [{ handle: fileHandle, kind: 'file', name: 'notes.txt', path: '', uri: 'html:///dropped-files/21/7/notes.txt' }],
    strings: [],
    uris: ['html:///dropped-files/21/7/notes.txt'],
  })
  expect(mockRpc.invocations).toEqual([['PersistentFileHandle.addHandle', 'html:///dropped-files/21/7/notes.txt', fileHandle]])
})

test('resolves electron paths from native files', async () => {
  const nativeFile = new File(['content'], 'notes.txt')
  const handle = { kind: 'file', name: 'notes.txt' } as FileSystemFileHandle
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'FileSystemHandle.getFilePathElectron'() {
      return '/tmp/notes.txt'
    },
  })

  await expect(resolve([{ file: nativeFile, kind: 'file', type: 'text/plain', value: handle }], [1], true)).resolves.toEqual({
    files: [{ handle, kind: 'file', name: 'notes.txt', path: '/tmp/notes.txt', uri: 'file:///tmp/notes.txt' }],
    strings: [],
    uris: ['file:///tmp/notes.txt'],
  })
  expect(mockRpc.invocations).toEqual([['FileSystemHandle.getFilePathElectron', nativeFile]])
})

test('uses electron paths resolved before files cross the worker boundary', async () => {
  const nativeFile = new File(['content'], 'notes.txt')
  const handle = { kind: 'file', name: 'notes.txt' } as FileSystemFileHandle
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'FileSystemHandle.getFilePathElectron'() {
      throw new Error('the cloned file must not be used to resolve the path')
    },
  })

  await expect(resolve([{ file: nativeFile, kind: 'file', path: '/tmp/notes.txt', type: 'text/plain', value: handle }], [1], true)).resolves.toEqual({
    files: [{ handle, kind: 'file', name: 'notes.txt', path: '/tmp/notes.txt', uri: 'file:///tmp/notes.txt' }],
    strings: [],
    uris: ['file:///tmp/notes.txt'],
  })
  expect(mockRpc.invocations).toEqual([])
})

test('resolves legacy electron files', async () => {
  const nativeFile = new File(['content'], 'legacy.txt')
  registerMockRpc(RpcId.RendererProcess, {
    'FileSystemHandle.getFilePathElectron'() {
      return 'C:\\tmp\\legacy.txt'
    },
  })

  await expect(resolve([{ kind: 'file-legacy', type: 'text/plain', value: nativeFile }], [1], true)).resolves.toEqual({
    files: [{ handle: undefined, kind: 'file', name: 'legacy.txt', path: 'C:\\tmp\\legacy.txt', uri: 'file:///C:/tmp/legacy.txt' }],
    strings: [],
    uris: ['file:///C:/tmp/legacy.txt'],
  })
})

test('uses retained uri data for an opaque Chromium drag id', async () => {
  registerMockRpc(RpcId.RendererProcess, {
    'Viewlet.getDragData'() {
      return {
        items: [
          { data: 'file:///workspace/one.txt\nfile:///workspace/two.txt', type: 'text/uri-list' },
          { data: 'ignored', type: 'text/plain' },
        ],
      }
    },
  })

  await expect(resolve([{ kind: 'string', type: 'chromium/x-drag-id', value: '8B1BC632EA890FDD4BDB7705EF0231B0' }], [1])).resolves.toEqual({
    files: [],
    strings: [],
    uris: ['file:///workspace/one.txt', 'file:///workspace/two.txt'],
  })
})

test('returns no retained uris when drag data is unavailable', async () => {
  registerMockRpc(RpcId.RendererProcess, {
    'Viewlet.getDragData'() {
      return undefined
    },
  })

  await expect(resolve([{ kind: 'string', type: '', value: '8B1BC632EA890FDD4BDB7705EF0231B0' }], [1])).resolves.toEqual({
    files: [],
    strings: [],
    uris: [],
  })
})

test('copies legacy browser files to memory and returns their uri', async () => {
  const nativeFile = new File(['content'], 'legacy.txt')
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'FileSystem.writeFile'() {},
  })

  await expect(resolve([{ kind: 'file-legacy', type: 'text/plain', value: nativeFile }], [1])).resolves.toEqual({
    files: [{ handle: undefined, kind: 'file', name: 'legacy.txt', path: '', uri: 'memfs:///dropped-files/21/1/legacy.txt' }],
    strings: [],
    uris: ['memfs:///dropped-files/21/1/legacy.txt'],
  })
  expect(mockRpc.invocations).toEqual([['FileSystem.writeFile', 'memfs:///dropped-files/21/1/legacy.txt', 'content']])
})

test.each([
  ['browser', false],
  ['Electron', true],
] as const)('returns an empty %s file entry when no file is available', async (_name, isElectron) => {
  await expect(resolve([{ kind: 'file', type: 'text/plain', value: {} as FileSystemFileHandle }], [1], isElectron)).resolves.toEqual({
    files: [{ handle: undefined, kind: 'file', name: '', path: '', uri: '' }],
    strings: [],
    uris: [],
  })
})
