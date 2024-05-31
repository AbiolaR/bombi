import { HttpClient } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Book } from 'src/app/models/book';
import { FileMimeType } from 'src/app/models/file-mime-type.enum';
import { LanguageMap } from 'src/app/models/language-map';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-upload-book-dialog',
  templateUrl: './upload-book-dialog.component.html',
  styleUrls: ['./upload-book-dialog.component.scss']
})
export class UploadBookDialogComponent {

  @ViewChild(MatMenuTrigger) langMenuTrigger: MatMenuTrigger | undefined;
  
  languages = LanguageMap;
  showError = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { book: Book, formData: FormData },
   private bookService: BookService, private http: HttpClient, private dialogRef: MatDialogRef<UploadBookDialogComponent>) {}

  openMenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.langMenuTrigger?.openMenu();
  }

  upload() {
    if (this.data.book.coverUrl) {
      this.http.get(this.data.book.coverUrl, { responseType: 'blob' }).subscribe({
        next: (image) => {
          if (image) {
            this.data.formData.set('coverFile', image, 
              `${this.data.book.coverUrl.split('/').pop()}.${FileMimeType[image.type as keyof typeof FileMimeType]}`);
          }          
        },
        complete: () => {
          this.uploadData();
        }
      });
    } else {
      this.uploadData();
    }

  }
  
  private uploadData() {
    this.data.formData.set("bookData", JSON.stringify(this.data.book));
    this.bookService.upload(this.data.formData).subscribe({
      next: (response) => {
        if (response.status) {
          this.dialogRef.close();
        } else {
          this.showErrorMessage();
        }
      },
      error: (() => this.showErrorMessage())
    });
  }

  private showErrorMessage() {
    this.showError = true;
    setTimeout(() => this.showError = false, 2000);
  }

}
