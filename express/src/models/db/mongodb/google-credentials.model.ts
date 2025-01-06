export interface GoogleCredentials {
    refresh_token?: string;
    access_token?: string;
    expiry_date?: number;
    token_type?: string;
    id_token?: string;
    scope?: string;
    state?: string;
}