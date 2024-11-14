import { GenericTolinoService } from "./generic-tolino.service";

export class WeltbildTolinoService extends GenericTolinoService {
    LOGIN_PAGE: string = 'https://www.weltbild.de/oauth2/authorize?client_id=4c20de744aa8b83b79b692524c7ec6ae&response_type=code&scope=ebook_library&redirect_uri=https://webreader.mytolino.com/library/';
    EMAIL_FIELD_SELECTOR: string = '#login_emailAddress';
    PASSWORD_FIELD_SELECTOR: string = '#login_password';
    TOKEN_URL: string = 'https://api.weltbild.de/rest/oauth2/token';
    RESELLER_ID: number = 10;
}