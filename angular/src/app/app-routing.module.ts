import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchResultsComponent } from './components/pages/search-results/search-results.component';
import { HomeComponent } from './components/pages/home/home.component';
import { PasswordResetComponent } from './components/pages/password-reset/password-reset.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'resetPassword/:hash', component: PasswordResetComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
