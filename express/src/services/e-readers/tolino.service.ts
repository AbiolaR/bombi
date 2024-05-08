import { By, Key, until } from "selenium-webdriver";
import { TolinoCredentials } from "../../models/tolino-credentials.model";
import SeleniumAutomationService from "../selenium-automation.service";
import { Type } from "selenium-webdriver/lib/logging";
import { findUserAsync } from "../dbman";
import { User } from "../../models/db/mongodb/user.model";
import { listBooks, testAuth } from "../tolinoman";
import { Credentials } from "../../models/credentials";
import { ServerResponse } from "../../models/server-response";

export class TolinoService {

    private readonly LOGIN_PAGE = 'https://www.weltbild.de/oauth2/authorize?client_id=4c20de744aa8b83b79b692524c7ec6ae&response_type=code&scope=ebook_library&redirect_uri=https://webreader.mytolino.com/library/';
    private readonly ACCOUNT_PAGE = 'https://webreader.mytolino.com/library/index.html#/account/';

    private readonly HOME_HEADER_SELECTOR = '[data-test-id=library-drawer-labelHome]';
    private readonly DEVICE_MANAGEMENT_BUTTON_SELECTOR = '[data-test-id=library-myAccount-buttonDeviceManagement]';
    private readonly DEVICE_ID_SELECTOR = 'body > div.handshake > div > div.content > div.datagrid > div:nth-child(1) > div.datacol.col-devices-deviceName > div.device-id';
    private readonly EMAIL_FIELD_ID = 'login_emailAddress';
    private readonly PASSWORD_FIELD_ID = 'login_password';

    private readonly NETWORK_RESPONSE = 'Network.responseReceived';
    private readonly REQUEST_EXTRA_INFO = 'Network.requestWillBeSentExtraInfo';
    private readonly GET_RESPONSE_BODY_COMMAND = 'Network.getResponseBody';

    private readonly TOKEN_URL = 'https://api.weltbild.de/rest/oauth2/token';

    private readonly SHORT_WAIT_DURATION = 5000;
    private readonly LONG_WAIT_DURATION = 10000;

    public async connect(username: string, credentials: Credentials): Promise<ServerResponse<undefined>> {
        let tolinoCredentials: TolinoCredentials;
        try {
            tolinoCredentials = await this.getTolinoCredentials(credentials.username, credentials.password);
        } catch(error) {
            console.error('Error while trying to log in to Tolino: ', error);
            return new ServerResponse(undefined, 2, 'error while attempting to log in');
        }

        if (!tolinoCredentials) {
            return new ServerResponse(undefined, 2, 'error while attempting to log in');
        }
        let user: User = await findUserAsync(username);
        user.eReaderDeviceId = tolinoCredentials.deviceId;
        user.eReaderRefreshToken = tolinoCredentials.refreshToken;

        let authResult = await testAuth(user);

        if (authResult.command && authResult.refresh_token) {
            return new ServerResponse();
        } else {
            return new ServerResponse(undefined, 3, 'error while executing tolino test auth');
        }
    }

    public async listBooks(username: string) {
        let user: User = await findUserAsync(username);

        await listBooks(user);
    }

    public async disconnect(username: string) {
        let user: User = await findUserAsync(username);
        user.eReaderDeviceId = undefined;
        user.eReaderRefreshToken = undefined;
        await user.save();
    }

    private async getTolinoCredentials(email: string, password: string): Promise<TolinoCredentials> {
        let credentials: TolinoCredentials;
        let driver = await SeleniumAutomationService.buildDriver();

        await driver.get(this.LOGIN_PAGE);
        await driver.findElement(By.id(this.EMAIL_FIELD_ID)).sendKeys(email);
        await driver.findElement(By.id(this.PASSWORD_FIELD_ID)).sendKeys(password, Key.RETURN);

        await driver.executeScript(this.createDB);

        await driver.wait(until.elementLocated(By.css(this.HOME_HEADER_SELECTOR)), 
            this.LONG_WAIT_DURATION);

        let refreshToken: string;
        let deviceId: string;

        await driver.manage().logs().get(Type.PERFORMANCE).then(async (log) => {
            for (const logEntry of log) {
                if (refreshToken && deviceId) break;

                let message = JSON.parse(logEntry.message).message;
                if (message.method == this.NETWORK_RESPONSE 
                && message.params.response.url == this.TOKEN_URL) {
                    let responseBody = JSON.parse((await driver.sendAndGetDevToolsCommand(
                        this.GET_RESPONSE_BODY_COMMAND, 
                        { requestId: message.params.requestId}) as any).body);
                    if (responseBody.refresh_token) {
                        refreshToken = responseBody.refresh_token;
                    }
                }
                if (message.method == this.REQUEST_EXTRA_INFO && message.params.headers.hardware_id) {
                    deviceId = message.params.headers.hardware_id;

                }
            }
        });

        if (refreshToken && deviceId) {
            credentials = new TolinoCredentials(deviceId, refreshToken);
        }

        driver.quit();

        return credentials;
    }

    private createDB = () => {
        const dbRequest = window.indexedDB.open('tolino-reseller', 3); 
        dbRequest.onupgradeneeded = (event) => { 
            dbRequest.result.createObjectStore('values', {keyPath: 'key'});
            
        }
        dbRequest.onsuccess = () => {
            const transaction = dbRequest.result.transaction(["values"], "readwrite"); 
            const oStore = transaction.objectStore("values");
            oStore.put({key: 'reseller', 
                value: {
                    "resellerId": 10,
                    "resellerName": "Weltbild",
                    "logo": "https://download.pageplace.de/partnerlogo/web/10_resellerlogo.png",
                    "showPromotion": false,
                    "descriptions": []
                }
            });
            oStore.put({key: 'country', 
                value: {
                    'country': 'Deutschland',
                    'countryCode': 'DE',
                    'language': 'Deutsch',
                    'languageTag': 'de-DE'
            }});
        }
    }
}