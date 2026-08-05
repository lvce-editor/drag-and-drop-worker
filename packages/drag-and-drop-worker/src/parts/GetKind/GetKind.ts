export const getKind = (handle: FileSystemHandle | undefined): 'directory' | 'file' => {
  return handle?.kind === 'directory' ? 'directory' : 'file'
}
