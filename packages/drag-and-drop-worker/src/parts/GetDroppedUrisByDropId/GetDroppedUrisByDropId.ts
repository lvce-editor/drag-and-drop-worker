import { getDroppedItemsByDropId } from '../GetDroppedItemsByDropId/GetDroppedItemsByDropId.ts'

export const getDroppedUrisByDropId = async (dropId: number, isElectron: boolean): Promise<readonly string[]> => {
  const { uris } = await getDroppedItemsByDropId(dropId, isElectron)
  return uris
}
