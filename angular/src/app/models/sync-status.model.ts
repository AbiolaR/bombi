export enum SyncStatus {
    IGNORE = 'IGNORE',
    WAITING = 'WAITING',
    UPCOMING = 'UPCOMING',
    SENT = 'SENT'
}

export class SyncStatusUtil {
    public static rank(syncStatus: SyncStatus) {
        switch (syncStatus) {
            case SyncStatus.UPCOMING:
                return 3
            case SyncStatus.WAITING:
                return 2
            case SyncStatus.SENT:
                return 1
            default:
                return 0;
        }
    }
}