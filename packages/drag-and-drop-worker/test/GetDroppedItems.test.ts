import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { getDroppedItems } from '../src/parts/GetDroppedItems/GetDroppedItems.ts'

const droppedDirectoryUriRegex = /^html:\/\/\/dropped-files\/\d+\/9\/src\/$/
const droppedFileUriRegex = /^html:\/\/\/dropped-files\/\d+\/7\/notes\.txt$/

test('returns empty grouped data when nothing was dropped', async () => {
  expect(await getDroppedItems([], false)).toEqual({ files: [], strings: [], uris: [] })
})

test('groups uri lists and strings', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [
        { kind: 'string', type: 'text/uri-list', value: '# comment\nfile:///one\r\nfile:///two' },
        { kind: 'string', type: 'text/plain', value: 'plain text' },
      ] as any
    },
  })

  expect(await getDroppedItems([1, 2], false)).toEqual({
    files: [],
    strings: ['plain text'],
    uris: ['file:///one', 'file:///two'],
  })
  expect(mockRpc.invocations).toEqual([['FileSystemHandle.getFileHandles', [1, 2]]])
})

test('persists browser file handles and returns html uris', async () => {
  const fileHandle = { kind: 'file', name: 'notes.txt' }
  const directoryHandle = { kind: 'directory', name: 'src' }
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [
        { kind: 'file', type: 'text/plain', value: fileHandle },
        { kind: 'file', type: '', value: directoryHandle },
      ] as any
    },
    'PersistentFileHandle.addHandle'() {},
  })

  const result = await getDroppedItems([7, 9], false)

  expect(result.files).toEqual([
    {
      handle: fileHandle,
      kind: 'file',
      name: 'notes.txt',
      path: '',
      uri: expect.stringMatching(droppedFileUriRegex),
    },
    {
      handle: directoryHandle,
      kind: 'directory',
      name: 'src',
      path: '',
      uri: expect.stringMatching(droppedDirectoryUriRegex),
    },
  ])
  expect(result.uris).toEqual([result.files[0].uri, result.files[1].uri])
  expect(mockRpc.invocations).toEqual([
    ['FileSystemHandle.getFileHandles', [7, 9]],
    ['PersistentFileHandle.addHandle', result.files[0].uri, fileHandle],
    ['PersistentFileHandle.addHandle', result.files[1].uri, directoryHandle],
  ])
})

test('resolves electron paths from native files carried by ids', async () => {
  const nativeFile = new File(['content'], 'notes.txt')
  const handle = { kind: 'file', name: 'notes.txt' }
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [{ file: nativeFile, kind: 'file', type: 'text/plain', value: handle }] as any
    },
    'FileSystemHandle.getFilePathElectron'() {
      return '/tmp/notes.txt'
    },
  })

  expect(await getDroppedItems([1], true)).toEqual({
    files: [{ handle, kind: 'file', name: 'notes.txt', path: '/tmp/notes.txt', uri: 'file:///tmp/notes.txt' }],
    strings: [],
    uris: ['file:///tmp/notes.txt'],
  })
  expect(mockRpc.invocations).toEqual([
    ['FileSystemHandle.getFileHandles', [1]],
    ['FileSystemHandle.getFilePathElectron', nativeFile],
  ])
})

test('resolves legacy electron files', async () => {
  const nativeFile = new File(['content'], 'legacy.txt')
  using _mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [{ kind: 'file-legacy', type: 'text/plain', value: nativeFile }] as any
    },
    'FileSystemHandle.getFilePathElectron'() {
      return 'C:\\tmp\\legacy.txt'
    },
  })

  expect(await getDroppedItems([1], true)).toEqual({
    files: [{ handle: undefined, kind: 'file', name: 'legacy.txt', path: 'C:\\tmp\\legacy.txt', uri: 'file:///C:/tmp/legacy.txt' }],
    strings: [],
    uris: ['file:///C:/tmp/legacy.txt'],
  })
})

test('uses retained uri data for an opaque Chromium drag id', async () => {
  using _mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [{ kind: 'string', type: 'chromium/x-drag-id', value: '8B1BC632EA890FDD4BDB7705EF0231B0' }] as any
    },
    'Viewlet.getDragData'() {
      return {
        items: [
          { data: 'file:///workspace/one.txt\nfile:///workspace/two.txt', type: 'text/uri-list' },
          { data: 'ignored', type: 'text/plain' },
        ],
      }
    },
  })

  expect(await getDroppedItems([1], false)).toEqual({
    files: [],
    strings: [],
    uris: ['file:///workspace/one.txt', 'file:///workspace/two.txt'],
  })
})

test('returns no retained uris when drag data is unavailable', async () => {
  using _mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [{ kind: 'string', type: '', value: '8B1BC632EA890FDD4BDB7705EF0231B0' }] as any
    },
    'Viewlet.getDragData'() {
      return undefined
    },
  })

  expect(await getDroppedItems([1], false)).toEqual({ files: [], strings: [], uris: [] })
})

test('keeps unsupported legacy browser files as clean file metadata', async () => {
  const nativeFile = new File(['content'], 'legacy.txt')
  using _mockRpc = RendererWorker.registerMockRpc({
    'FileSystemHandle.getFileHandles'() {
      return [{ kind: 'file-legacy', type: 'text/plain', value: nativeFile }] as any
    },
  })

  expect(await getDroppedItems([1], false)).toEqual({
    files: [{ handle: undefined, kind: 'file', name: 'legacy.txt', path: '', uri: '' }],
    strings: [],
    uris: [],
  })
})
