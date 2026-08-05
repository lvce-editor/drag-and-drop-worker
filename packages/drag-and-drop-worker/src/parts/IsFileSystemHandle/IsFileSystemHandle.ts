export const isFileSystemHandle = (value: unknown): value is FileSystemHandle => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<FileSystemHandle>
  return (candidate.kind === 'directory' || candidate.kind === 'file') && typeof candidate.name === 'string'
}
