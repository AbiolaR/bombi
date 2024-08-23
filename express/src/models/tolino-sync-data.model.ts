export interface TolinoSyncData {
    patches: TolinoSyncPatch[]
}

interface TolinoSyncPatch {
    path: string,
    value: TolinoSyncPatchValue
}

interface TolinoSyncPatchValue {
    progress: number
}