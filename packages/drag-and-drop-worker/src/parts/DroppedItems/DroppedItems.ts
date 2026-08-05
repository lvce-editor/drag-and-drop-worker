export interface DroppedFile {
  readonly handle: FileSystemHandle | undefined
  readonly kind: 'directory' | 'file'
  readonly name: string
  readonly path: string
  readonly uri: string
}

export interface DroppedItems {
  readonly files: readonly DroppedFile[]
  readonly strings: readonly string[]
  readonly uris: readonly string[]
}
