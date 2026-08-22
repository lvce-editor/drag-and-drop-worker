import { expect, test } from '@jest/globals'
import { registerMockRpc, RpcId } from '@lvce-editor/rpc-registry'
import { discardDrop } from '../src/parts/DiscardDrop/DiscardDrop.ts'
import { getDroppedFileHandlesByDropId } from '../src/parts/GetDroppedFileHandlesByDropId/GetDroppedFileHandlesByDropId.ts'
import { getDroppedItemsByDropId } from '../src/parts/GetDroppedItemsByDropId/GetDroppedItemsByDropId.ts'
import { getDroppedUrisByDropId } from '../src/parts/GetDroppedUrisByDropId/GetDroppedUrisByDropId.ts'

test('resolves ordered browser drop data by drop id', async () => {
  const file = new File(['legacy content'], 'legacy.txt')
  const handle = { kind: 'directory', name: 'src' }
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return [
        { index: 0, kind: 'string', type: 'text/uri-list', value: 'file:///workspace/readme.md' },
        { file, index: 1, kind: 'file', name: 'legacy.txt', type: 'text/plain' },
        { fileSystemHandle: handle, index: 3, kind: 'file', name: 'src', type: '' },
      ] as any
    },
    'FileSystem.writeFile'() {},
    'PersistentFileHandle.addHandle'() {},
  })

  const result = await getDroppedItemsByDropId(17, false)

  expect(result).toEqual({
    files: [
      {
        handle: undefined,
        kind: 'file',
        name: 'legacy.txt',
        path: '',
        uri: 'memfs:///dropped-files/17/1/legacy.txt',
      },
      {
        handle,
        kind: 'directory',
        name: 'src',
        path: '',
        uri: 'html:///dropped-files/17/3/src/',
      },
    ],
    strings: [],
    uris: ['file:///workspace/readme.md', 'memfs:///dropped-files/17/1/legacy.txt', 'html:///dropped-files/17/3/src/'],
  })
  expect(mockRpc.invocations).toEqual([
    [
      'DropData.get',
      17,
      {
        formats: ['string', 'file', 'fileSystemHandle'],
        includeElectronFilePaths: false,
      },
    ],
    ['FileSystem.writeFile', 'memfs:///dropped-files/17/1/legacy.txt', 'legacy content'],
    ['PersistentFileHandle.addHandle', 'html:///dropped-files/17/3/src/', handle],
  ])
})

test('returns only uris for a URI consumer', async () => {
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return [{ index: 0, kind: 'string', type: 'text/uri-list', value: 'file:///workspace/notes.txt' }] as any
    },
  })

  await expect(getDroppedUrisByDropId(9, true)).resolves.toEqual(['file:///workspace/notes.txt'])
  expect(mockRpc.invocations).toEqual([
    [
      'DropData.get',
      9,
      {
        formats: ['string', 'file', 'fileSystemHandle'],
        includeElectronFilePaths: true,
      },
    ],
  ])
})

test('uses Electron paths supplied by the renderer', async () => {
  const handle = { kind: 'file', name: 'notes.txt' }
  const file = new File(['content'], 'notes.txt')
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return [
        {
          electronFilePath: '/tmp/notes.txt',
          file,
          fileSystemHandle: handle,
          index: 0,
          kind: 'file',
          name: 'notes.txt',
          type: 'text/plain',
        },
      ] as any
    },
  })

  await expect(getDroppedItemsByDropId(4, true)).resolves.toEqual({
    files: [{ handle, kind: 'file', name: 'notes.txt', path: '/tmp/notes.txt', uri: 'file:///tmp/notes.txt' }],
    strings: [],
    uris: ['file:///tmp/notes.txt'],
  })
  expect(mockRpc.invocations).toHaveLength(1)
})

test('uses Electron paths for legacy files without handles', async () => {
  const file = new File(['content'], 'legacy.txt')
  registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return [
        {
          electronFilePath: '/tmp/legacy.txt',
          file,
          index: 0,
          kind: 'file',
          name: 'legacy.txt',
          type: 'text/plain',
        },
      ] as any
    },
  })

  await expect(getDroppedItemsByDropId(8, true)).resolves.toEqual({
    files: [{ handle: undefined, kind: 'file', name: 'legacy.txt', path: '/tmp/legacy.txt', uri: 'file:///tmp/legacy.txt' }],
    strings: [],
    uris: ['file:///tmp/legacy.txt'],
  })
})

test('requests only file-system file handles for Chat', async () => {
  const fileHandle = { kind: 'file', name: 'notes.txt' }
  const directoryHandle = { kind: 'directory', name: 'src' }
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return [
        { fileSystemHandle: fileHandle, index: 0, kind: 'file', name: 'notes.txt', type: 'text/plain' },
        { fileSystemHandle: directoryHandle, index: 1, kind: 'file', name: 'src', type: '' },
      ] as any
    },
  })

  await expect(getDroppedFileHandlesByDropId(11)).resolves.toEqual([fileHandle])
  expect(mockRpc.invocations).toEqual([['DropData.get', 11, { formats: ['fileSystemHandle'], includeElectronFilePaths: false }]])
})

test('discards a drop without requesting any representation', async () => {
  const mockRpc = registerMockRpc(RpcId.RendererProcess, {
    'DropData.get'() {
      return []
    },
  })

  await discardDrop(12)
  expect(mockRpc.invocations).toEqual([['DropData.get', 12, { formats: [], includeElectronFilePaths: false }]])
})
