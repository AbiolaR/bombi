import { GenericTolinoService } from "./generic-tolino.service";

export class HugendubelTolinoService extends GenericTolinoService {
    LOGIN_PAGE: string = 'https://www.hugendubel.de/oauth/authorize?client_id=4c20de744aa8b83b79b692524c7ec6ae&response_type=code&scope=ebook_library&redirect_uri=https%3A%2F%2Fwebreader.mytolino.com%2Flibrary%2F';
    EMAIL_FIELD_SELECTOR: string = 'input[type=email]';
    PASSWORD_FIELD_SELECTOR: string = 'input[type=password]';
    TOKEN_URL: string = 'https://www.hugendubel.de/oauth/token';
    RESELLER_ID: number = 13;
}