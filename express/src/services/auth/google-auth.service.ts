import { google } from "googleapis";
import { DEC } from "../secman";
import { findUser } from "../db/mongo-db.service";
import axios from "axios";
import { RevokeCredentialsResult } from "google-auth-library/build/src/auth/oauth2client";
import { GaxiosError, GaxiosResponse } from "googleapis-common";

export class GoogleAuthenticationService {
    private static readonly CLIENT_ID = DEC('U2FsdGVkX1+bYsXJNTah6Lg2sw92wEhp9JrbIqi2M7l/tnIpdGC52eP8Wsl6jOwvm9ZqPZTYfje+6K0t2wJ7vUppFru5nxMrqaG1SnbV/4hNbxNGn9kyBr9DgV6PBCtt');
    private static readonly CLIENT_SECRET = DEC('U2FsdGVkX1+2IQEoYOzkgFfvO4mSKwMBcXo+cq3WQb5e1R/Zs7yp5SWYgmyZ5aztaPj2BTHFKGQ18Yo/GNkN5Q==');
    private static readonly REDIRECT_URI = DEC('U2FsdGVkX19RslR3Ejqe+OGFY27LWwuuk62pncK4KZKscuj/3yNNfZwomea8simNdBvBb9hqhB0IK2ntxl4JQ3Xy/aefO6dtr+XIhnLKkLs=');
    private static readonly SCOPES = ['https://www.googleapis.com/auth/books'];

    private static oauth2Client = new google.auth.OAuth2(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        this.REDIRECT_URI
    );

    public static createAuthUrl(state: string): string {
        /*this.oauth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                console.log('tokens: ', tokens);
                console.log('Refresh token: ', tokens.refresh_token);
            }
        });*/

        return this.oauth2Client.generateAuthUrl({
            response_type: 'code',
            access_type: 'offline',
            scope: this.SCOPES,
            include_granted_scopes: true,
            state: state
        });
    }

    public static async getTokens(code: string) {
        //console.log('tokens obj: ', await this.oauth2Client.getToken(code));
        //console.log('tokens: ', (await this.oauth2Client.getToken(code)).tokens);
        return (await this.oauth2Client.getToken(code)).tokens;
    }

    public static async getAuth(username: string) {
        const authClient = new google.auth.OAuth2(
            this.CLIENT_ID,
            this.CLIENT_SECRET,
            this.REDIRECT_URI
        );
        const user = await findUser(username);
        if (!user?.googleCredentials) {
            return;
        }
        authClient.setCredentials(user.googleCredentials);

        return authClient;
    }

    public static async removeAuth(username: string): Promise<boolean> {
        const user = await findUser(username);
        if (!user?.googleCredentials) {
            return;
        }

        let response: GaxiosResponse<RevokeCredentialsResult>;

        try {
            response = await this.oauth2Client.revokeToken(user.googleCredentials.access_token);
        } catch (error) {
            if (error.response?.data?.error == 'invalid_token') {
                user.googleCredentials = undefined;
                await user.save();

                return true;
            }
            return false;
        }

        if (!response.data.success) {
            return false;
        }

        user.googleCredentials = undefined;
        await user.save();

        return true;
    }

}