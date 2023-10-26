import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Book } from 'src/app/models/book';

@Component({
  selector: 'app-add-message-dialog',
  templateUrl: './add-message-dialog.component.html',
  styleUrls: ['./add-message-dialog.component.scss']
})
export class AddMessageDialogComponent {
  message: string = '';

  constructor(private dialogRef: MatDialogRef<AddMessageDialogComponent>) {}

  public sendWithMessage() {
    this.dialogRef.close(this.message);
  }
}
