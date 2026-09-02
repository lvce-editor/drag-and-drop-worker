import { getDropData } from '../DropData/DropData.ts'

export const getDroppedFilesByDropId = async (dropId: number): Promise<readonly File[]> => {
  const items = await getDropData(dropId, {
    formats: ['file'],
    includeElectronFilePaths: false,
  })
  const files: File[] = []
  for (const item of items) {
    if (item.kind === 'file' && item.file) {
      files.push(item.file)
    }
  }
  return files
}
