export class Book {
    id: number = 0;
    md5: string = '';
    isbn: string = '';
    title: string = '';
    author: string = '';
    series: string = '';
    publisher: string = '';
    language: string = 'English';
    filesize: number = 0;
    extension: string = 'epub';
    filename: string = '';
    coverUrl: string = '';
    message: string = '';
    progress: number = 0;
    pubDate: Date | undefined;
    local: boolean = false;
    
    public get year() {
        if (!this.pubDate) return 0;
        return new Date(this.pubDate).getFullYear();
    }
}