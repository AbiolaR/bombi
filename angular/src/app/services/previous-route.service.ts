import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {

  private previousUrl: string = '';

  constructor(private router: Router) {
    this.router.events.pipe(filter((event: any) => event instanceof RoutesRecognized), pairwise())
    .subscribe((events: RoutesRecognized[]) => {
      this.previousUrl = events[1].urlAfterRedirects;
    });
  }

  public getPreviousUrl() {
    return this.previousUrl;
  } 
}
