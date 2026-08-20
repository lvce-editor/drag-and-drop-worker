import { getDropData } from '../DropData/DropData.ts'

export const discardDrop = async (dropId: number): Promise<void> => {
  await getDropData(dropId, {
    formats: [],
    includeElectronFilePaths: false,
  })
}
