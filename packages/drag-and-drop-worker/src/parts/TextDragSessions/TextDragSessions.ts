import type { TextDragData } from '../TextDragData/TextDragData.ts'

const sessions = new Map<number, TextDragData>()
const state = {
  nextSessionId: 1,
}

const clone = (data: TextDragData): TextDragData => {
  return {
    endOffset: data.endOffset,
    sourceUri: data.sourceUri,
    startOffset: data.startOffset,
    text: data.text,
  }
}

export const createTextDrag = (data: TextDragData): number => {
  const sessionId = state.nextSessionId++
  sessions.set(sessionId, clone(data))
  return sessionId
}

export const discardTextDrag = (sessionId: number): void => {
  sessions.delete(sessionId)
}

export const takeTextDrag = (sessionId: number): TextDragData | undefined => {
  const data = sessions.get(sessionId)
  sessions.delete(sessionId)
  return data && clone(data)
}

export const clearTextDrags = (): void => {
  sessions.clear()
  state.nextSessionId = 1
}
