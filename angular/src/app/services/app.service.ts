import { Injectable } from '@angular/core';
import { UserData } from '../models/user-data';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../models/language';

const LANGUAGE_KEY = 'language';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  userData: UserData = new UserData();

  constructor(private userService: UserService, private translateService: TranslateService) {
    translateService.setDefaultLang(Language.EN);
  }

  public setLanguage(language: Language = Language.UNKNOWN) {
    this.userData = this.userService.getLocalUserData()
    let saveData = false;
    if (language == Language.UNKNOWN) {
      language = this.userData.language;
      if (language == Language.UNKNOWN) {
        saveData = true;
      }
    }
    if(this.translateService.currentLang == language) {
      return
    }

    switch(language || navigator.language) {
      case Language.DE: {
        this.translateService.use(Language.DE);
        language = Language.DE;
        break;
      }
      case 'de-DE': {
        this.translateService.use(Language.DE);
        language = Language.DE;
        break;
      }
      default: {
        this.translateService.use(Language.EN);
        language = Language.EN;
      }
    }
    if (saveData) {
      this.userService.saveUserDataProperty(LANGUAGE_KEY, language);
    }
  }
}
