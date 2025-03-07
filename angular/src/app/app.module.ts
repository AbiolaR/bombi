import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/pages/home/home.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchResultsComponent } from './components/pages/search-results/search-results.component';
import { SearchComponent } from './components/search/search.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BookComponent } from './components/book/book.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DownloadClusterComponent } from './components/download-cluster/download-cluster.component';
import { LoginComponent } from './components/login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { ProfileDialogComponent } from './components/dialogs/profile-dialog/profile-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { EReaderConfigComponent } from './components/ereader-config/ereader-config.component';
import { RegisterDialogComponent } from './components/dialogs/register-dialog/register-dialog.component';
import { ImageDialogComponent } from './components/dialogs/image-dialog/image-dialog.component';
import { CustomUrlDialogComponent } from './components/dialogs/custom-url-dialog/custom-url-dialog.component';
import { ResetPasswordDialogComponent } from './components/dialogs/reset-password-dialog/reset-password-dialog.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import {  MatAutocompleteModule  } from '@angular/material/autocomplete';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedBooksComponent } from './components/pages/shared-books/shared-books.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MessageComponent } from './components/message/message.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChatComponent } from './components/chat/chat.component';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { ChatOverviewComponent } from './components/chat-overview/chat-overview.component';
import { AddContactDialogComponent } from './components/dialogs/add-contact-dialog/add-contact-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocialReadingPlatformConfigComponent } from './components/social-reading-platform-config/social-reading-platform-config.component';
import { SrpSyncDialogComponent } from './components/dialogs/srp-sync-dialog/srp-sync-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AddMessageDialogComponent } from './components/dialogs/add-message-dialog/add-message-dialog.component';
import { PocketBookConfigComponent } from './components/pocket-book-config/pocket-book-config.component';
import { MatRadioModule } from '@angular/material/radio';
import { RequestsComponent } from './components/pages/requests/requests.component';
import { UploadBookDialogComponent } from './components/dialogs/upload-book-dialog/upload-book-dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BookProgressPageComponent } from './components/pages/book-progress-page/book-progress-page.component';
import { BookTitleComponent } from "./components/book-title/book-title.component";
import { BarcodeScannerComponent } from './components/dialogs/barcode-scanner/barcode-scanner-component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchResultsComponent,
    SearchComponent,
    BookComponent,
    DownloadClusterComponent,
    LoginComponent,
    ProfileDialogComponent,
    EReaderConfigComponent,
    RegisterDialogComponent,
    ImageDialogComponent,
    CustomUrlDialogComponent,
    ResetPasswordDialogComponent,
    PasswordResetComponent,
    SharedBooksComponent,
    MessageComponent,
    ChatComponent,
    ChatOverviewComponent,
    AddContactDialogComponent,
    SocialReadingPlatformConfigComponent,
    SrpSyncDialogComponent,
    AddMessageDialogComponent,
    PocketBookConfigComponent,
    RequestsComponent,
    UploadBookDialogComponent,
    HeaderComponent,
    BookProgressPageComponent,
    BarcodeScannerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatRippleModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSlideToggleModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    MatBadgeModule,
    MatSidenavModule,
    MatExpansionModule,
    ServiceWorkerModule.register('custom-service-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
    }),
    BookTitleComponent
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
