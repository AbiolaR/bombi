import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Credentials } from 'src/app/models/credentials';
import { PocketBookSyncType } from 'src/app/models/pocketbook-sync-type.enum';
import { UserData } from 'src/app/models/user-data';
import { UserRelatedData } from 'src/app/models/user-related-data';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ereader-config',
  templateUrl: './ereader-config.component.html',
  styleUrls: ['./ereader-config.component.scss']
})
export class EReaderConfigComponent implements OnInit {

  @Input()
  userRelatedData: UserRelatedData = new UserRelatedData();
  @Output()
  userRelatedDataChange: EventEmitter<UserData> = new EventEmitter<UserData>();

  activeEReader: string = '';
  credentials = new Credentials();
  executingRequest = false;
  isPasswordHidden = true;
  errorText = '';


  constructor(private bookService: BookService, private translate: TranslateService,
    private userService: UserService) { }

  ngOnInit(): void {
    switch (this.userRelatedData.eReaderType) {
      case 'K': // Kindle
        this.activeEReader = 'Kindle';
        break;
      case 'T': // Tolino
        this.activeEReader = 'Tolino';
        break;
      case 'P':
        this.activeEReader = 'PocketBook';
        break;
      default:
        this.userRelatedData.eReaderType = 'K';
        break;
    }
  }

  public submit(event: any) {
    if (event?.key == 'Enter' && this.credentials.valid()) {
      this.connectTolino();
    }
  }

  connectTolino() {
    if (this.executingRequest) return;
    this.executingRequest = true;
    this.bookService.connectTolino(this.credentials).subscribe({
      next: (response) => {
        this.executingRequest = false;
        switch (response.status) {
          case 0:
            this.errorText = '';
            this.credentials = new Credentials();
            this.updateUserData();
            break;
          case 2:
            this.errorText = this.translate.instant('could-not-connect-due-to-invalid-credentials');
            break;
          default:
            this.errorText = this.translate.instant('an-error-occured-please-try-again-or-contact-the-bombi-owner');
            break;
        }
      },
      error: () => {
        this.executingRequest = false;
        this.errorText = this.translate.instant('could-not-reach-server-please-try-again-in-a-few-minutes-or-contact-the-bombi-owner');
      }
    })
  }

  disconnectTolino() {
    if (this.executingRequest) return;
    this.executingRequest = true;
    this.bookService.disconnectTolino().subscribe({
      next: (response) => {
        if (response.status == 0) {
          this.executingRequest = false;
          this.updateUserData();
        }
      }
    });
  }

  private updateUserData() {
    this.userService.updateUserData().subscribe({
      next: (userData: UserData) => {
        this.userRelatedData = userData;
        this.userRelatedDataChange.emit(userData);
      }
    });
  }
}