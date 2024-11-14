import { By, Key, until } from "selenium-webdriver";
import { Credentials } from "../../models/credentials";
import { Book } from "../../models/db/book.model";
import { User } from "../../models/db/mongodb/user.model";
import { ServerResponse } from "../../models/server-response";
import { TolinoCredentials } from "../../models/tolino-credentials.model";
import { TolinoInventoryData } from "../../models/tolino-inventory-data.model";
import { TolinoSyncData } from "../../models/tolino-sync-data.model";
import { findUserAsync } from "../dbman";
import SeleniumAutomationService from "../selenium-automation.service";
import { getBooksProgress, listBooks, testAuth } from "../tolinoman";
import { Type } from "selenium-webdriver/lib/logging";

export abstract class GenericTolinoService {

    abstract LOGIN_PAGE: string;
    abstract EMAIL_FIELD_SELECTOR: string;
    abstract PASSWORD_FIELD_SELECTOR: string;
    abstract TOKEN_URL: string;
    abstract RESELLER_ID: number;

    //private readonly ACCOUNT_PAGE = 'https://webreader.mytolino.com/library/index.html#/account/';

    private readonly HOME_HEADER_SELECTOR = '[data-test-id=library-drawer-labelHome]';
    //private readonly DEVICE_MANAGEMENT_BUTTON_SELECTOR = '[data-test-id=library-myAccount-buttonDeviceManagement]';
    //private readonly DEVICE_ID_SELECTOR = 'body > div.handshake > div > div.content > div.datagrid > div:nth-child(1) > div.datacol.col-devices-deviceName > div.device-id';

    private readonly NETWORK_RESPONSE = 'Network.responseReceived';
    private readonly REQUEST_EXTRA_INFO = 'Network.requestWillBeSentExtraInfo';
    private readonly GET_RESPONSE_BODY_COMMAND = 'Network.getResponseBody';


    //private readonly SHORT_WAIT_DURATION = 5000;
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
        return await listBooks(user);
    }

    public async getBooksProgress(username: string): Promise<Book[]> {
        let user: User = await findUserAsync(username);
        let books: Book[] = [];

        if (!user.eReaderDeviceId || !user.eReaderRefreshToken) {
            return books;
        }

        const syncData: TolinoSyncData = await getBooksProgress(user);
        const bookData: TolinoInventoryData = await listBooks(user);
        
        if (!syncData.patches || !bookData.PublicationInventory) return books;

        syncData.patches.forEach(patch => {
            const publicationId = patch.path.split('/publications/').pop().split('/').shift();
            const inventoryItem = bookData.PublicationInventory.edata
                .find(item => item.publicationId == publicationId);

            books.push(new Book(0, '', inventoryItem.epubMetaData.title, 
                inventoryItem.epubMetaData.author.shift()?.name, '', '', '', '', 
                new Date(patch.value.modified), '.epub', '',
                inventoryItem.epubMetaData.fileResource
                    .find(resource => resource.type == 'FRONTCOVERIMAGE').resource, 
                    Math.round(patch.value.progress * 100)));
        });
        return books;
    }

    public async disconnect(username: string) {
        let user: User = await findUserAsync(username);
        user.eReaderDeviceId = undefined;
        user.eReaderRefreshToken = undefined;
        await user.save();
    }

    async getTolinoCredentials(email: string, password: string): Promise<TolinoCredentials> {
        let credentials: TolinoCredentials;
        let driver = await SeleniumAutomationService.buildDriver();
        
        await driver.get('https://webreader.mytolino.com/library/index.html');
        await driver.executeScript(this.createDB, this.RESELLER_ID);
        await driver.get(this.LOGIN_PAGE);
        let emailField = await driver.wait(until.elementLocated(By.css(this.EMAIL_FIELD_SELECTOR)), 10000);
        emailField.sendKeys(email);
        await driver.findElement(By.css(this.PASSWORD_FIELD_SELECTOR)).sendKeys(password, Key.RETURN);
        
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
            if (refreshToken.startsWith('-')) {
                refreshToken = refreshToken.substring(1);
            }
            credentials = new TolinoCredentials(deviceId, refreshToken);
        }

        driver.quit();

        return credentials;
    }

    private createDB = (resellerId: number) => {        
        const dbRequest = window.indexedDB.open('tolino-reseller', 3); 
        dbRequest.onupgradeneeded = (event) => { 
            dbRequest.result.createObjectStore('values', {keyPath: 'key'});
            
        }
        dbRequest.onsuccess = () => {
            const transaction = dbRequest.result.transaction(["values"], "readwrite"); 
            const oStore = transaction.objectStore("values");
            oStore.put({key: 'reseller', 
                value: {
                    "resellerId": resellerId,
                    "embedded": false
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