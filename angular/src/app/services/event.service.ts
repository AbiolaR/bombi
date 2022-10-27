import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  public menuEvent = new EventEmitter<boolean>();

  constructor() { }

  openLoginMenu() {
    this.menuEvent.emit(true);
  }

  closeLoginMenu() {
    this.menuEvent.emit(false);
  }
}
