import Axios, { AxiosResponse, HttpStatusCode } from "axios";
import applyCaseMiddleware from "axios-case-converter";
import { BookBlob } from "../../models/book-blob.model";
import { findUserAsync } from "../dbman";
import { PocketBookCloudConfig } from "../../models/db/mongodb/pocketbook-cloud-config.model";
import { User } from "../../models/db/mongodb/user.model";
import { Credentials } from "../../models/credentials";
import { PocketBookProvider } from "../../models/pocket-book-provider";
import { Book } from "../../models/db/book.model";
import { PocketBookInventoryData } from "../../models/pocket-book-inventory-data.model";

export class PocketBookCloudService {
    private static axios = applyCaseMiddleware(Axios.create());

    private static readonly API_BASE_URL = 'https://cloud.pocketbook.digital/api'

    private static readonly CLIENT_ID = 'qNAx1RDb';
    private static readonly CLIENT_SECRET = 'K3YYSjCgDJNoWKdGVOyO1mrROp3MMZqqRNXNXTmh';
    private static readonly LOGIN_URL = this.API_BASE_URL + '/v1.0/auth/login';

    private static readonly GRANT_TYPE_PASSWORD = 'password';
    private static readonly GRANT_TYPE_REFRESH = 'refresh_token';
    private static readonly REFRESH_TOKEN_ENDPOINT = '/v1.0/auth/renew-token';
    private static readonly UPLOAD_FILE_ENDPOINT = '/v1.1/files/book.epub';
    private static readonly INVENTORY_ENDPOINT = '/v1.0/books?limit=100';
    private static readonly TOKEN_EXPIRED_ERROR_CODE = 224;

    private static FORMDATA_HEADERS = { 'Content-Type': 'multipart/form-data', 'Authorization': '' }
    private static EPUB_FILE_HEADERS = { 'Content-Type': 'application/epub+zip', 'Authorization': '' }

    public static async getProviders(email: string): Promise<PocketBookProvider[]> {
        let response: AxiosResponse;
        try {

            response = await this.axios.get(
                `${this.LOGIN_URL}?username=${email}&client_id=${this.CLIENT_ID}&client_secret=${this.CLIENT_SECRET}`
                );
        } catch(err) {
            console.error(err);
        }

        return response?.data.providers;
    }

    public static async connect(username: string, credentials: Credentials, provider: PocketBookProvider): Promise<boolean> {
        const user: User = await findUserAsync(username);
        if (!user) return;

        let loginData = new FormData();
        loginData.append('shop_id', provider.shopId.toString());
        loginData.append('client_id', this.CLIENT_ID);
        loginData.append('client_secret', this.CLIENT_SECRET);
        loginData.append('grant_type', this.GRANT_TYPE_PASSWORD);
        loginData.append('username', credentials.username);
        loginData.append('password', credentials.password);

        let response: AxiosResponse;
        
        try {
            response = await this.axios.post<PocketBookCloudConfig>(
                `${this.LOGIN_URL}/${provider.alias}`, loginData, 
                { headers: this.FORMDATA_HEADERS });
                
        } catch(err) {
            console.error(err);
        }
        
        if (response?.status == HttpStatusCode.Ok) {
            this.saveAuthData(user, response.data);
            return true;
        }
        return false;
    }

    public static async disconnect(username: string) {
        const user: User = await findUserAsync(username);
        if (!user) return;

        user.pocketBookConfig.cloudConfig = undefined;
        await user.save();
    }

    public static async uploadBook(user: User, book: BookBlob): Promise<boolean> {
        if (!user.pocketBookConfig.cloudConfig.accessToken 
            || !user.pocketBookConfig.cloudConfig.refreshToken) return false;
        
        let headers = this.EPUB_FILE_HEADERS;
        headers.Authorization = `Bearer ${user.pocketBookConfig.cloudConfig.accessToken}`;

        let response: AxiosResponse;
        try {
            response = await this.axios.put(this.API_BASE_URL + this.UPLOAD_FILE_ENDPOINT,
                book.data,
                { headers: headers, maxBodyLength: Infinity });
        } catch(err) {
            response = err.response;
        }

        switch (response?.status) {
            case HttpStatusCode.Ok:
                return true;
            case HttpStatusCode.Unauthorized:
                if (response?.data.errorCode == this.TOKEN_EXPIRED_ERROR_CODE) {
                    if (await this.refreshToken(user)){
                        return this.uploadBook(user, book);
                    }
                }
            case HttpStatusCode.Conflict:
                if (response?.data.errorCode == 303) {
                    return true;
                }
            default:
                console.error(`[ERROR] failed to upload book ${book.filePath}`, response?.data);
        }
        return false;
    }

    public static async getBooksProgress(username: string): Promise<Book[]> {
        let books: Book[] = [];

        const user: User = await findUserAsync(username);
        if (!user || !user.pocketBookConfig?.cloudConfig) {
            return books;
        }

        let headers = { Authorization:  `Bearer ${user.pocketBookConfig.cloudConfig.accessToken}` };

        let response: AxiosResponse<PocketBookInventoryData>;
        try {
            response = await this.axios.get(this.API_BASE_URL + this.INVENTORY_ENDPOINT,
                { headers: headers });
        } catch(err) {
            response = err.response;
        }

        switch (response?.status) {
            case HttpStatusCode.Ok:
                response.data.items.forEach(item => {
                    books.push(new Book(0, '', item.metadata.title, item.metadata.authors, '', '', '',
                        '', item.mtime, '.epub', '', item.metadata.cover.pop().path,
                        Math.round(item.readPercent)
                    ));
                });
                return books;
            case HttpStatusCode.Unauthorized:
                if (response?.data.errorCode == this.TOKEN_EXPIRED_ERROR_CODE) {
                    if (await this.refreshToken(user)){
                        return this.getBooksProgress(user.username);
                    }
                }
            default:
                return books;
        }
    }

    public static async refreshToken(user: User): Promise<boolean> {
        if (!user.pocketBookConfig.cloudConfig.accessToken 
            || !user.pocketBookConfig.cloudConfig.refreshToken) return false;

        let refreshData = new FormData();
        refreshData.append('grant_type', this.GRANT_TYPE_REFRESH);
        refreshData.append('refresh_token', user.pocketBookConfig.cloudConfig.refreshToken);

        let headers = this.FORMDATA_HEADERS;
        headers.Authorization = `Bearer ${user.pocketBookConfig.cloudConfig.accessToken}`;

        let response: AxiosResponse;
        
        try {
            response = await this.axios.post<PocketBookCloudConfig>(
                this.API_BASE_URL + this.REFRESH_TOKEN_ENDPOINT, refreshData,
                { headers: headers });
        } catch(err) {
            console.error(err);
        }

        if (response?.status == HttpStatusCode.Ok) {
            this.saveAuthData(user, response.data);
            return true;
        }
        return false;
    }

    private static async saveAuthData(user: User, data: PocketBookCloudConfig): Promise<void> {
        user.pocketBookConfig.cloudConfig = new PocketBookCloudConfig(data.accessToken, data.refreshToken);
        await user.save();
    }
}