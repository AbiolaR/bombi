export class UserRelatedData {
    status: number = 1;
    username: String = '';
    email: String = '';
    eReaderEmail: String = '';
    eReaderType: String = 'K';
    eReaderRefreshToken: String = '';
    eReaderDeviceId: String = '';

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
    
    private notStarred(v: any) {
        if (typeof v !== 'string') return true;
        return !v.startsWith('*****');
    }
}