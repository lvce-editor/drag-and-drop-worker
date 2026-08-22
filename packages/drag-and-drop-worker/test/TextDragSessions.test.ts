import { beforeEach, expect, test } from '@jest/globals'
import { dropCommandMap } from '../src/parts/DropCommandMap/DropCommandMap.ts'
import { clearTextDrags, createTextDrag, discardTextDrag, takeTextDrag } from '../src/parts/TextDragSessions/TextDragSessions.ts'

beforeEach(() => {
  clearTextDrags()
})

const textDrag = {
  endOffset: 10,
  sourceUri: 'file:///workspace/readme.md',
  startOffset: 5,
  text: 'hello',
}

test('creates sequential text drag session ids', () => {
  expect(createTextDrag(textDrag)).toBe(1)
  expect(createTextDrag(textDrag)).toBe(2)
})

test('takes text drag data once', () => {
  const sessionId = createTextDrag(textDrag)

  expect(takeTextDrag(sessionId)).toEqual(textDrag)
  expect(takeTextDrag(sessionId)).toBeUndefined()
})

test('retains multiline text exactly', () => {
  const data = {
    ...textDrag,
    endOffset: 17,
    text: 'first\nsecond',
  }

  expect(takeTextDrag(createTextDrag(data))).toEqual(data)
})

test('stores an immutable snapshot of the drag data', () => {
  const mutableData = { ...textDrag }
  const sessionId = createTextDrag(mutableData)
  mutableData.text = 'changed'

  expect(takeTextDrag(sessionId)).toEqual(textDrag)
})

test('returns a copy of the stored drag data', () => {
  const sessionId = createTextDrag(textDrag)
  const result = takeTextDrag(sessionId) as { text: string }
  result.text = 'changed'

  expect(result).toEqual({ ...textDrag, text: 'changed' })
})

test('discards text drag data', () => {
  const sessionId = createTextDrag(textDrag)

  discardTextDrag(sessionId)

  expect(takeTextDrag(sessionId)).toBeUndefined()
})

test('discarding an unknown text drag is a no-op', () => {
  expect(() => discardTextDrag(999)).not.toThrow()
})

test('exposes text drag lifecycle commands', () => {
  expect(dropCommandMap['DragAndDrop.createTextDrag']).toBe(createTextDrag)
  expect(dropCommandMap['DragAndDrop.discardTextDrag']).toBe(discardTextDrag)
  expect(dropCommandMap['DragAndDrop.takeTextDrag']).toBe(takeTextDrag)
})
