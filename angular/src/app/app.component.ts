import { Component, ChangeDetectorRef } from '@angular/core';
import { AppService } from './services/app.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bombi';

  constructor(private appService: AppService, private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.appService.setLanguage();
    if (this.userService.isLoggedIn()) {
      this.userService.updateUserData().subscribe();
    }
    this.listenForUpdate();
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
