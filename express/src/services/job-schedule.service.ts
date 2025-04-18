import { scheduleJob, scheduledJobs } from "node-schedule";
import { BookSyncService } from "./book/book-sync.service";
import { findAllUsersAsync } from "./dbman";
import { PocketBookCloudService } from "./e-readers/pocketbook-cloud.service";
import { User } from "../models/db/mongodb/user.model";

export class JobScheduler {
    private static DAILY_UPDATE_UPCOMING_EXPRESSION = '0 7 * * *';
    private static HOURLY_SYNC_EXPRESSION = '0 8-23,0-2 * * *';
    private static DAILY_POCKETBOOK_AUTH_REFRESH_EXPRESSION = '0 6 * * *';

    public static scheduleJobs() {
        const isProd = process.env.STAGE == 'prod' ? true : false;
        if (isProd && !scheduledJobs[this.dailyUpdateUpcoming.name]) {
            scheduleJob(this.dailyUpdateUpcoming.name,this.DAILY_UPDATE_UPCOMING_EXPRESSION, this.dailyUpdateUpcoming);
        }
        if (isProd && !scheduledJobs[this.hourlySync.name]) {
            scheduleJob(this.hourlySync.name, this.HOURLY_SYNC_EXPRESSION, this.hourlySync);
        }
        if (isProd && !scheduledJobs[this.pocketBookAuthRefresh.name]) {
            scheduleJob(this.pocketBookAuthRefresh.name, this.DAILY_POCKETBOOK_AUTH_REFRESH_EXPRESSION, this.pocketBookAuthRefresh);
        }
    }

    private static dailyUpdateUpcoming() {
        try {
            let bookSyncService = new BookSyncService();
            bookSyncService.updateUpcoming().then(() => {
                bookSyncService.reSyncBooks().catch(error => {
                    console.error(error);
                });
            }).catch(error => {
                console.error(error);
            });
        } catch(error) {
            console.error(error);
        }
    }

    private static hourlySync() {
        try {
            new BookSyncService().reSyncBooks().catch(error => {
                console.error(error);
            });
        } catch(error) {
            console.error(error);
        }
    }

    private static async pocketBookAuthRefresh() {
        console.info('[INFO] Starting PocketBook auth refresh job');
        try {
            const users = (await findAllUsersAsync())
                .filter((user: User) => user.pocketBookConfig?.cloudConfig);
            for (const user of users) {
                await PocketBookCloudService.refreshToken(user);
            }
            console.info('[INFO] PocketBook auth refresh job completed');
        } catch(error) {
            console.error('[ERROR] during PocketBook auth refresh\n', error);
        }
    }
}