export interface PocketBookInventoryData {
    items: PocketBookInventoryItem[],
    errorCode: number
}

interface PocketBookInventoryItem {
    metadata: InventoryItemMetadata,
    readPercent: number,
    mtime: Date
}

interface InventoryItemMetadata {
    title: string,
    authors: string,
    cover: MetadataCover[],
}

interface MetadataCover {
    path: string
}
