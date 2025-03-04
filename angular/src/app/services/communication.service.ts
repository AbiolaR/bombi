import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private barcodeScanTriggerSubject = new Subject<void>();

  triggerBarcodeScan() {
    this.barcodeScanTriggerSubject.next();
  }

  barcodeScanTriggered() {
    return this.barcodeScanTriggerSubject.asObservable();
  }
}
