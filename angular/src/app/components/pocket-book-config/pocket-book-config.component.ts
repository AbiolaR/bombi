import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PocketBookSyncType } from 'src/app/models/pocketbook-sync-type.enum';
import { Credentials } from 'src/app/models/credentials';
import { BookService } from 'src/app/services/book.service';
import { PocketBookProvider } from 'src/app/models/pocketbook-provider';
import { PocketBookConfig } from 'src/app/models/pocketbook-config';
import { isValidEmail } from 'src/app/helpers/validation';
import { PocketBookCloudConfig } from 'src/app/models/pocketbook-cloud-config';
import { response } from 'express';
import { UserService } from 'src/app/services/user.service';
import { UserData } from 'src/app/models/user-data';

@Component({
  selector: 'app-pocket-book-config',
  templateUrl: './pocket-book-config.component.html',
  styleUrls: ['./pocket-book-config.component.scss']
})
export class PocketBookConfigComponent {
  @Input()
  pocketBookConfig = new PocketBookConfig();
  @Output()
  pocketBookConfigChange = new EventEmitter<PocketBookConfig>();

  credentials: Credentials = new Credentials();
  pocketBookSyncType = PocketBookSyncType;
  selectedPocketBookSyncType: PocketBookSyncType = PocketBookSyncType.POCKETBOOK_CLOUD;
  isPasswordHidden = true;
  errorText = '';
  isLoading = false;

  initialEmail = this.pocketBookConfig.sendToEmail;
  providers: PocketBookProvider[] = [];
  selectedProvider: PocketBookProvider | undefined;
  providerSelected = false;
  isValidEmail = isValidEmail;

  constructor(private bookService: BookService, private userService: UserService) {}

  submit(event: any) {
    if (event?.key == 'Enter') {
      switch (this.selectedPocketBookSyncType) {
        case PocketBookSyncType.POCKETBOOK_CLOUD:
          if (this.credentials.valid()) {
            this.connect()
          } else if (this.credentials.valid(true)) {
            this.getProviders();
          }
          break;
        case PocketBookSyncType.SEND_TO_POCKETBOOK:
          this.setEmail();
          break;
      }
    }
  }

  getProviders() {    
    if (!this.credentials.valid(true) || this.isLoading ) return;
    this.errorText = '';
    this.isLoading = true;

    this.bookService.getPocketBookProviders(this.credentials.username).subscribe({
      next: (response) => {      
        switch (response.status) {
          case 0:
            this.providers = response.data;
            break;      
          default:
            this.errorText = response.message;
            break;
        }
        this.isLoading = false;
      }
    });
  }

  connect() {
    if (!this.credentials.valid() || !this.selectedProvider || this.isLoading) return;
    this.errorText = '';
    this.isLoading = true;

    this.bookService.connectPocketBookCloud(this.credentials, this.selectedProvider).subscribe({
      next: (response) => {
        switch (response.status) {
          case 0:
            this.updatePocketBookConfig();
            //this.pocketBookConfig.cloudConfig = new PocketBookCloudConfig('**********', '**********');
            break;        
          default:
            this.errorText = response.message;
            break;
        }
        this.isLoading = false; 
      },
      error: () => {
        this.errorText = 'The server could not be reached';
        this.isLoading = false;
      }
    });
  }

  disconnect() {
    this.isLoading = true;
    this.bookService.disconnectPocketBookCloud().subscribe({
      next: () => {
        this.isLoading = false;
        this.updatePocketBookConfig();
      },
      error: () => {
        this.isLoading = false;
      }
    })
  }

  setEmail() {
    if (!this.shouldSetEmail()) return;

    // TODO implement
    this.initialEmail = this.pocketBookConfig.sendToEmail;

    this.pocketBookConfigChange.emit(this.pocketBookConfig);
  }

  shouldSetEmail(): boolean {
    return (this.pocketBookConfig.sendToEmail == '' 
        || isValidEmail(this.pocketBookConfig.sendToEmail)) 
        && this.pocketBookConfig.sendToEmail != this.initialEmail
  }

  private updatePocketBookConfig() {
    this.userService.updateUserData().subscribe({
      next: (userData: UserData) => {
        this.pocketBookConfig = userData.pocketBookConfig!;
        this.pocketBookConfigChange.emit(this.pocketBookConfig);
      }
    });
  }
}
