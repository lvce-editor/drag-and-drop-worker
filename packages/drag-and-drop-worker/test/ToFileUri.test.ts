import { expect, test } from '@jest/globals'
import { toFileUri } from '../src/parts/ToFileUri/ToFileUri.ts'

test('keeps existing file uris unchanged', () => {
  expect(toFileUri('file:///tmp/already.txt')).toBe('file:///tmp/already.txt')
})

test('converts and encodes posix paths', () => {
  expect(toFileUri('/tmp/hello world#draft?.txt')).toBe('file:///tmp/hello%20world%23draft%3F.txt')
})

test('converts windows paths', () => {
  expect(toFileUri('C:\\tmp\\hello world.txt')).toBe('file:///C:/tmp/hello%20world.txt')
})
