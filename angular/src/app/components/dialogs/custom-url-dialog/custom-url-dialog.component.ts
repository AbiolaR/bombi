import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomBook } from 'src/app/models/custom-book';
import { DownloadMode } from 'src/app/models/download-mode';

@Component({
  selector: 'app-custom-url-dialog',
  templateUrl: './custom-url-dialog.component.html',
  styleUrls: ['./custom-url-dialog.component.scss']
})
export class CustomUrlDialogComponent {

  customBook = new CustomBook();

  URL = DownloadMode.URL;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 
    this.customBook.filename = data.filename;
  }

}
