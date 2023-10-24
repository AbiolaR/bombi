import { Language } from "./language";

export enum SyncLanguage {
    ENGLISH = 'English',
    GERMAN = 'German'
}

export class SyncLanguageUtil {
    public static map(language: string): SyncLanguage {
        switch (language) {
            case Language.EN:
                return SyncLanguage.ENGLISH;
            case Language.DE:
                return SyncLanguage.GERMAN;
            default:
                return SyncLanguage.ENGLISH;
        }
    }
}