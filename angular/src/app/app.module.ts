import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
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
import { HttpClientModule } from '@angular/common/http';
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
    MatMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
