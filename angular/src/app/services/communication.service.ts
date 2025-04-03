import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private barcodeScanTriggerSubject = new Subject<void>();
  private allowedNavigationUrls: string[] = [];
  private eReaderTypeSubject = new Subject<string>();

  triggerBarcodeScan() {
    this.barcodeScanTriggerSubject.next();
  }

  barcodeScanTriggered() {
    return this.barcodeScanTriggerSubject.asObservable();
  }

  setAllowedNavigationUrls(urls: string[]) {
    this.allowedNavigationUrls = urls;
  }

  getAllowedNavigationUrls() {
    return this.allowedNavigationUrls;
  }  

  changeEReaderType(eReaderType: string) {
    this.eReaderTypeSubject.next(eReaderType);
  }

  eReaderTypeChanged() {
    return this.eReaderTypeSubject.asObservable();
  }
}
