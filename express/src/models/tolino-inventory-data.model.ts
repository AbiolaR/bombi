export interface TolinoInventoryData {
    PublicationInventory: PublicationInventory
}

interface PublicationInventory {
    edata: InventoryItem[]
}

interface InventoryItem {
    publicationId: string,
    epubMetaData: InventoryItemMetaData
}

interface InventoryItemMetaData {
    title: string
    author: MetaDataAuthor[]
    fileResource: MetaDataFileResource[]
}

interface MetaDataAuthor {
    name: string
}

interface MetaDataFileResource {
    resource: string,
    type: string
}