import { expect, test } from '@jest/globals'
import { getNativeFile } from '../src/parts/GetNativeFile/GetNativeFile.ts'
import { isFileSystemHandle } from '../src/parts/IsFileSystemHandle/IsFileSystemHandle.ts'

test('recognizes only file system handle shaped values', () => {
  expect(isFileSystemHandle(undefined)).toBe(false)
  expect(isFileSystemHandle({ kind: 'file' })).toBe(false)
})

test('does not treat a raw file system handle as a native file', () => {
  expect(getNativeFile({ kind: 'file', name: 'notes.txt' } as FileSystemHandle)).toBeUndefined()
})
