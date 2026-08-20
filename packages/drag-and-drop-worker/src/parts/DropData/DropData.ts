import { RendererWorker } from '@lvce-editor/rpc-registry'

export type DropDataFormat = 'file' | 'fileSystemHandle' | 'string'

export interface DropDataOptions {
  readonly formats: readonly DropDataFormat[]
  readonly includeElectronFilePaths: boolean
}

export interface DropDataStringItem {
  readonly index: number
  readonly kind: 'string'
  readonly type: string
  readonly value: string
}

export interface DropDataFileItem {
  readonly electronFilePath?: string
  readonly file?: File
  readonly fileSystemHandle?: FileSystemHandle
  readonly index: number
  readonly kind: 'file'
  readonly name: string
  readonly type: string
}

export type DropDataItem = DropDataFileItem | DropDataStringItem

export const getDropData = async (dropId: number, options: DropDataOptions): Promise<readonly DropDataItem[]> => {
  return RendererWorker.invoke('DropData.get', dropId, options)
}
