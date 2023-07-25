import { User } from "./user";
import { UserData } from "./user-data";

export class UserRelatedData {
    status: number = 1;
    username: string = '';
    email: String = '';
    eReaderEmail: String = '';
    eReaderType: String = 'U';
    eReaderRefreshToken: String = '';
    eReaderDeviceId: String = '';
    searchHistory: Map<string, string> = new Map();

    sanitize(): void {
        if (this.eReaderDeviceId && this.eReaderDeviceId.length > 4) {
            this.eReaderDeviceId = `*****${this.eReaderDeviceId.slice(-4)}`;
          }
          if (this.eReaderRefreshToken) {
            this.eReaderRefreshToken = '**********';
        }
    }

    removeEmpty(): any {
         return Object.fromEntries(Object.entries(this).filter(([_, v]) => v != ''));
      }

    removeStarred(): any {
        return Object.fromEntries(Object.entries(this).filter(([_, v]) => this.notStarred(v)));
    }

    deleteOldSearchHistoryEntries() {
        for (;this.searchHistory.size > 5;) {
            this.searchHistory.delete(this.getOldestSearchHistoryEntry());
        }
    }

    getNewestSearchHistoryEntry() : string {
        return this.searchHistory.get(this.getLastOrFirstSearchHistoryEntry(this.compareLower))!;
    }

    private getOldestSearchHistoryEntry() : string {
        return this.getLastOrFirstSearchHistoryEntry(this.compareHigher);
    }

    private getLastOrFirstSearchHistoryEntry(comparator: (a: string, b: string) => boolean) : string {
        var found = this.searchHistory.keys().next().value;
        this.searchHistory.forEach((value, key) => {
            if (comparator(found, key)) {
            found = key;
            }
        });
        return found;
    }

    private compareHigher(a: string, b: string) {
        return a > b;
    }

    private compareLower(a: string, b: string) {
        return a < b;
    }

    private notStarred(v: any) {
        if (typeof v !== 'string') return true;
        return !v.startsWith('*****');
    }
}