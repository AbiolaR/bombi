import { Builder, ChromiumWebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { Level, Preferences, Type } from "selenium-webdriver/lib/logging";

export default class SeleniumAutomationService {
    private static BROWSER: string = 'chrome';
    private static HEADLESS_ARGUMENT: string = '--headless=new';
    private static NO_SANDBOX_ARGUMENT: string = '--no-sandbox';
    private static ENABLE_LOGGING_SWITCH: string = 'enable-logging';
    private static CHROME_BINARY_PATH: string = '/usr/bin/chromium-browser';

    public static async buildDriver(): Promise<ChromiumWebDriver> {
        const headless = true;
        const prod = process.env.STAGE == 'prod';

        let options = new Options();
        let loggingPrefs = new Preferences();
        loggingPrefs.setLevel(Type.PERFORMANCE, Level.ALL);
        options.setLoggingPrefs(loggingPrefs);
        if (headless) {
            options.addArguments(this.HEADLESS_ARGUMENT, this.NO_SANDBOX_ARGUMENT);
            options.excludeSwitches(this.ENABLE_LOGGING_SWITCH);

            if (prod) {
                options.setChromeBinaryPath(this.CHROME_BINARY_PATH);
            }
        }
        return (await new Builder().forBrowser(this.BROWSER).setChromeOptions(options)
            .build() as ChromiumWebDriver);
    }
}