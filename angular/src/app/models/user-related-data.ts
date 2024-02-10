import { Language } from "./language";
import { Contact } from "./contact";
import { PocketBookConfig } from "./pocketbook-config";

const SEARCH_HISTORY_MAX_SIZE = 100;

export class UserRelatedData {
    status: number = 1;
    username: string = '';
    email: String = '';
    eReaderEmail: String = '';
    eReaderType: String = 'U';
    eReaderRefreshToken: String = '';
    eReaderDeviceId: String = '';
    searchHistory: Map<string, string> = new Map();
    language: Language = Language.UNKNOWN;
    unreadMessageAmount: number = 0;
    friendRequests: string[] = [];
    contacts: Contact[] = [];
    pushSubscriptions: PushSubscription[] = [];
    tsgUsername: string = '';
    tsgCookies: string[] = [];
    grUserId: string = '';
    grCookies: string[] = [];
    pocketBookConfig: PocketBookConfig = new PocketBookConfig();

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

    removeLanguage(): any {
        return Object.fromEntries(Object.entries(this).filter(([k, _]) => k != 'language'));
    }

    deleteOldSearchHistoryEntries() {
        for (;this.searchHistory.size > SEARCH_HISTORY_MAX_SIZE;) {
            this.searchHistory.delete(this.getOldestSearchHistoryEntry());
        }
    }

    getNewestSearchHistoryEntry() : string {
        return this.searchHistory.get(this.getLastOrFirstSearchHistoryEntry(this.compareLower))!;
    }

    shortSearchHistory() : Map<string, string> {
        return new Map([...this.searchHistory.entries()].sort(this.keyDescOrder).slice(0,5));
    }

    private getOldestSearchHistoryEntry() : string {
        return this.getLastOrFirstSearchHistoryEntry(this.compareHigher);
    }

    keyDescOrder = (a: [string,string], b: [string,string]): number => {
        return +a[0] > +b[0] ? -1 : (+b[0] > +a[0] ? 1 : 0);
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
        if (v.cloudConfig) return false;
        if (typeof v !== 'string') return true;
        return !v.startsWith('*****');
    }
}