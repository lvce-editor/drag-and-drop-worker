import type { DroppedStringItem } from '../DroppedItem/DroppedItem.ts'

const chromiumDragIdRegex = /^[A-F\d]{32}$/i

export const isChromiumDragId = (item: DroppedStringItem): boolean => {
  return (item.type === '' || item.type === 'chromium/x-drag-id') && chromiumDragIdRegex.test(item.value)
}
