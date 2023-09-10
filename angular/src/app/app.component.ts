import { Component, ChangeDetectorRef } from '@angular/core';
import { AppService } from './services/app.service';
import { SwPush } from '@angular/service-worker';
import { UserService } from './services/user.service';

const PUBLIC_VAPID_KEY = 'BKoDZzDgSyM4qGa9wvX_u3udANeC-8Cn3JGmSfJKfUEp37edT0JFNXl85w_QfsK7ft7NjwJneG7Wz6HmTynRCuU';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bombi';

  constructor(private appService: AppService, private swPush: SwPush, private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.appService.setLanguage();
    this.userService.updateUserData().subscribe();
    this.requestNotificationPermission();
    this.listenForUpdate();
  }

  private requestNotificationPermission() {
    if (this.userService.isLoggedIn() && Notification.permission != 'granted') {
      this.swPush.requestSubscription({serverPublicKey: PUBLIC_VAPID_KEY})
      .then(subscription => {
        this.userService.getUserData().subscribe({
          next: (userData) => {            
            userData.pushSubscriptions.push(subscription);
            this.userService.saveUserDataProperty('pushSubscriptions', userData.pushSubscriptions).subscribe({});
          }
        })
      })
      .catch();
    }
  }

  private listenForUpdate() {
    navigator.serviceWorker.onmessage = (event) => {
      if (event.data && event.data.type == 'UPDATE_USERDATA') {
        this.userService.updateUserData().subscribe({
          next: () => {
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    }
  }
}
