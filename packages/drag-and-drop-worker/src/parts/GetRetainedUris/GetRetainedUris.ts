import { RendererWorker } from '@lvce-editor/rpc-registry'
import { parseUriList } from '../ParseUriList/ParseUriList.ts'

interface DragInfoItem {
  readonly data: string
  readonly type: string
}

interface DragInfo {
  readonly items: readonly DragInfoItem[]
}

export const getRetainedUris = async (): Promise<readonly string[]> => {
  const dragInfo = (await RendererWorker.invoke('Viewlet.getDragData')) as DragInfo | undefined
  if (!dragInfo || !Array.isArray(dragInfo.items)) {
    return []
  }
  const uris: string[] = []
  for (const item of dragInfo.items) {
    if (item.type === 'text/uri-list' && typeof item.data === 'string') {
      uris.push(...parseUriList(item.data))
    }
  }
  return uris
}
