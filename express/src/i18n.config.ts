import i18n from "i18n";

i18n.configure({
    locales: ['en', 'de'],
    defaultLocale: 'en',
    directory: './locales',
    api: {
        '__': 'translate',
        '__n': 'translatePlurals'
    }
});

export default i18n;