import axios from "axios";
import { LibgenDbService } from "./libgen-db.service";
import { SyncRequest } from "../models/sync-request.model";
import { ServerResponse } from "http";

export class BookSyncService {

    private readonly LIBGEN_FICTION = 'https://library.lol/fiction/';
    private TEST_HASH: Promise<string>;
    private TEST_HASH_KEY = 'test_hash';

    constructor(private libgenDbService: LibgenDbService) {        
        this.TEST_HASH = libgenDbService.getParam(this.TEST_HASH_KEY);
    }

    async updateHostIp() {
        const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?=">GET<)/g);
        const regexHostIp = new RegExp(/(?<=\/\/)(.*?)(?=\/)/g);

        var config = {
            method: 'get',
            url: `${this.LIBGEN_FICTION}${await this.TEST_HASH}`,
          };
        
          var result = await axios(config);
          const page = await result.data;

        var downloadURL = '';
        try {
          downloadURL = page.match(regexDownloadURL).toString();
          let hostIp = downloadURL.match(regexHostIp).toString();
          if(hostIp) {
            this.libgenDbService.updateHostIp(hostIp);
          }
        } catch(error) {
          console.log('Error while trying to update host ip: ', error);
        }
    }

    
}