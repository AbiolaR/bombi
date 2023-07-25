import { LanguageMap } from "./language-map";

export class SearchString extends String {
    public addLanguageFilter(lang: string): string {
        if (!this) {
            return '';
        }
        return `${this} lang: ${lang}`;
    }
}