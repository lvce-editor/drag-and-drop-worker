import { expect, test } from '@jest/globals'
import { parseUriList } from '../src/parts/ParseUriList/ParseUriList.ts'

test('parses uri lists', () => {
  expect(parseUriList(' # comment\n file:///one \r\n\nfile:///two')).toEqual(['file:///one', 'file:///two'])
})
