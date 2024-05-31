import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Epub from 'epubjs';
import { Book } from 'src/app/models/book';
import { SyncLanguageUtil } from 'src/app/models/sync-language.model';
import { MatDialog } from '@angular/material/dialog';
import { UploadBookDialogComponent } from '../../dialogs/upload-book-dialog/upload-book-dialog.component';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  @ViewChild('dropZone') dropZone: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('browseButton') browseButton: MatButton | undefined;

  EPUB_FILE_TYPE = 'application/epub+zip';
  ADMIN_ROLE = 'admin';

  showError = false;

  constructor(private dialog: MatDialog, private userService: UserService,
     private router: Router) {}  
  
  ngOnInit(): void {
    let shouldRedirect = true;
    this.userService.getRole().subscribe({
      next: (response) => {
        if (response.data === this.ADMIN_ROLE) {
          shouldRedirect = false;
        }
      },
      complete: () => {
        if (shouldRedirect) {
          this.router.navigateByUrl('home')
        }
      }
    });
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
        book.year = new Date(metadata.pubdate).getFullYear();
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

  dragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  dragEnter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.dropZone && this.browseButton) {
      this.dropZone.nativeElement.classList.add('drag-over');
      console.log('browsebutn: ', this.browseButton)
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

}
