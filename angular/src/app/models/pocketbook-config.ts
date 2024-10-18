import { PocketBookCloudConfig } from "./pocketbook-cloud-config";

export class PocketBookConfig {
    cloudConfig: PocketBookCloudConfig | undefined;
    sendToEmail: string = '';
}