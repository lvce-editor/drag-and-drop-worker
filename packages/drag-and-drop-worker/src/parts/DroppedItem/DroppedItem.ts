export interface DroppedStringItem {
  readonly kind: 'string'
  readonly type: string
  readonly value: string
}

interface DroppedFileItem {
  readonly file?: File
  readonly kind: 'file'
  readonly path?: string
  readonly type: string
  readonly value: FileSystemHandle
}

interface DroppedLegacyFileItem {
  readonly kind: 'file-legacy'
  readonly path?: string
  readonly type: string
  readonly value: File
}

export type DroppedFileItemLike = DroppedFileItem | DroppedLegacyFileItem | FileSystemHandle

export type DroppedItem = DroppedFileItemLike | DroppedStringItem
