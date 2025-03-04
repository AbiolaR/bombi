import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchResultsComponent } from './components/pages/search-results/search-results.component';
import { HomeComponent } from './components/pages/home/home.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';
import { SharedBooksComponent } from './components/pages/shared-books/shared-books.component';
import { RequestsComponent } from './components/pages/requests/requests.component';
import { BookProgressPageComponent } from './components/pages/book-progress-page/book-progress-page.component';
import { closeDialogGuard } from './guards/close-dialog.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: 'search', component: SearchResultsComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: 'shared', component: SharedBooksComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: 'resetPassword/:hash', component: PasswordResetComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: 'requests', component: RequestsComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: 'progress', component: BookProgressPageComponent, runGuardsAndResolvers: 'always', canDeactivate: [closeDialogGuard] },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
