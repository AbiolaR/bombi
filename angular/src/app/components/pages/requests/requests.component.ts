import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Epub from 'epubjs';
import { Book } from 'src/app/models/book';
import { SyncLanguageUtil } from 'src/app/models/sync-language.model';
import { MatDialog } from '@angular/material/dialog';
import { UploadBookDialogComponent } from '../../dialogs/upload-book-dialog/upload-book-dialog.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { SyncRequest } from 'src/app/models/sync-request.model';
import { BookService } from 'src/app/services/book.service';
import { SyncStatus, SyncStatusUtil } from 'src/app/models/sync-status.model';
import { SocialReadingPlatformService } from 'src/app/services/social-reading-platform.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  @ViewChild('dropZone') dropZone: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('browseButton') browseButton: MatButton | undefined;
  @ViewChild(MatMenuTrigger) requestContextMenu: MatMenuTrigger | undefined;

  EPUB_FILE_TYPE = 'application/epub+zip';
  ADMIN_ROLE = 'admin';

  showError = false;
  syncRequests: SyncRequest[] = [];
  showMissing = true;
  showUpcoming = false;
  showSent = false;

  constructor(private dialog: MatDialog, private userService: UserService,
     private router: Router, private bookService: BookService, 
     private srpService: SocialReadingPlatformService) {}  
  
  ngOnInit(): void {
    let shouldRedirect = true;
    this.userService.getRole().subscribe({
      next: (response) => {
        if (response.data === this.ADMIN_ROLE) {
          shouldRedirect = false;
          this.fetchSyncRequests();
        }
      },
      complete: () => {
        if (shouldRedirect) {
          this.router.navigateByUrl('home');
        }
      }
    });
  }

  public filteredSyncRequests(): SyncRequest[] {
    let filteredSyncRequests = this.syncRequests;
    let today = new Date();
    filteredSyncRequests = filteredSyncRequests.filter(syncRequest => {
      return (this.showMissing 
          && (syncRequest.status == SyncStatus.UPCOMING && new Date(syncRequest.pubDate) < today))
      || (this.showUpcoming 
          && (syncRequest.status == SyncStatus.UPCOMING && new Date(syncRequest.pubDate) > today))
      || (this.showSent && syncRequest.status == SyncStatus.SENT)
    });
    return filteredSyncRequests;
  }

  public getMetadata(event: any) {   
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone && this.browseButton) {
      this.dropZone.nativeElement.classList.remove('drag-over');
      this.browseButton._elementRef.nativeElement.style.pointerEvents = 'all';
    }
    this.showError = false;
    
    let file: File;
    if (event.dataTransfer?.items) {
      file = event.dataTransfer.items[0].getAsFile();
    } else {
      file = event.target.files[0];
    } 

    if (file.type != this.EPUB_FILE_TYPE) {
      this.showError = true;
      setTimeout(() => this.showError = false, 2000)
      return;
    }

    let epubBook = Epub(file as unknown as ArrayBuffer);
    epubBook.loaded.metadata.then((metadata) => {
      epubBook.coverUrl().then((url) => {
        const book = new Book();
        book.author = this.parseAuthor(metadata.creator);
        book.coverUrl = url || '';
        book.title = metadata.title;
        book.pubDate = new Date(metadata.pubdate);
        book.language = SyncLanguageUtil.map(metadata.language);
        book.isbn = this.parseIsbn(metadata.identifier);

        const formData = new FormData();
        formData.set('bookFile', file);

        const dialogRef = this.dialog.open(UploadBookDialogComponent, {
          width: '1000px',
          data: { book: book, formData: formData }
        });
        dialogRef.afterClosed().subscribe(() => {
          epubBook.destroy();
          event.target.value = '';
        });
      });
    });
  }

  public copyToClipboard(text: string) {
    setTimeout(() => {
      this.requestContextMenu?.closeMenu();
    }, 0);
    navigator.clipboard.writeText(text);
  }

  public markSent(syncRequest: SyncRequest) {
    let changedRequest = Object.assign({}, syncRequest, { status: SyncStatus.SENT });
    
    this.srpService.sendSyncRequests([changedRequest]).subscribe({
      next: (response) => {
        if (response.status == 0) {
          this.requestContextMenu?.closeMenu();
          syncRequest.status = SyncStatus.SENT;
          this.sortRequests();
        }
      }
    });
  }

  dragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  dragEnter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone && this.browseButton) {
      this.dropZone.nativeElement.classList.add('drag-over');
      this.browseButton._elementRef.nativeElement.style.pointerEvents = 'none';
    }
  }

  dragLeave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone && this.browseButton) {
      this.dropZone.nativeElement.classList.remove('drag-over');
      this.browseButton._elementRef.nativeElement.style.pointerEvents = 'all';
    }
  }

  private fetchSyncRequests() {
    this.bookService.getSyncRequests().subscribe({
      next: (response) => {
        if (response.status == 0) {
          this.sortRequests(response.data);
        }
      }
    })
  }

  private parseAuthor(author: string): string {
    if (!author.includes(', ')) {
      return author;
    }
    const splitAuthor = author.split(', ');

    return splitAuthor[1] + ' ' + splitAuthor[0];
  }

  private parseIsbn(isbn: string): string {
    if (isbn.startsWith('isbn:')) {
      return isbn.replace('isbn:', '');
    }
    if (isbn.length == 13 && (isbn.startsWith('978') || isbn.startsWith('979'))) {
      return isbn;
    }
    return '';
  }

  private sortSyncRequests(a: SyncRequest, b: SyncRequest): number {
    if (a.status == b.status) {
      if (a.creationDate < b.creationDate) {
        return 1;
      }
    } else {
      if (SyncStatusUtil.rank(a.status) < SyncStatusUtil.rank(b.status)) {
        return 1;
      }
    }
    return -1;
  }

  public parseSinceDate(syncRequest: SyncRequest): string {
    const today = new Date(new Date().toLocaleDateString());
    const requestDate = new Date(new Date(syncRequest.creationDate).toLocaleDateString());
    if (today.getTime() == requestDate.getTime()) {
      return 'today';
    }
    const differenceInDays = Math.round((today.getTime() - requestDate.getTime()) / (1000 * 3600 * 24));
    if (differenceInDays == 1) {
      return `${differenceInDays} day ago`;
    } else {
      return `${differenceInDays} days ago`;
    }
  }

  public status(syncRequest: SyncRequest): string {
    if (syncRequest.status == SyncStatus.UPCOMING) {
      let today = new Date();
      if (new Date(syncRequest.pubDate) < today) {
        return 'MISSING';
      }
    }
    return syncRequest.status;
  }

  public sortRequests(syncRequests: SyncRequest[] = this.syncRequests) {
    this.syncRequests = syncRequests.sort(this.sortSyncRequests); 
  }

}
