import { getDropData } from '../DropData/DropData.ts'

export const getDroppedFileHandlesByDropId = async (dropId: number): Promise<readonly FileSystemFileHandle[]> => {
  const items = await getDropData(dropId, {
    formats: ['fileSystemHandle'],
    includeElectronFilePaths: false,
  })
  const handles: FileSystemFileHandle[] = []
  for (const item of items) {
    if (item.kind === 'file' && item.fileSystemHandle?.kind === 'file') {
      handles.push(item.fileSystemHandle as FileSystemFileHandle)
    }
  }
  return handles
}
