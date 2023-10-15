import { scheduleJob, scheduledJobs } from "node-schedule";
import { BookSyncService } from "./book/book-sync.service";

export class JobScheduler {
    private static DAILY_UPDATE_UPCOMING_EXPRESSION = '0 7 * * *';
    private static HOURLY_SYNC_EXPRESSION = '0 8-23,0-2 * * *';

    public static scheduleJobs() {
        const isProd = process.env.STAGE == 'prod' ? true : false;
        if (isProd && !scheduledJobs[this.dailyUpdateUpcoming.name]) {
            scheduleJob(this.dailyUpdateUpcoming.name,this.DAILY_UPDATE_UPCOMING_EXPRESSION, this.dailyUpdateUpcoming);
        }
        if (isProd && !scheduledJobs[this.hourlySync.name]) {
            scheduleJob(this.hourlySync.name, this.HOURLY_SYNC_EXPRESSION, this.hourlySync);
        }
    }

    private static dailyUpdateUpcoming() {
        try {
            let bookSyncService = new BookSyncService();
            bookSyncService.updateHostIp().then(() => {
                bookSyncService.updateUpcoming().then(() => {
                    bookSyncService.reSyncBooks().catch(error => {
                        console.error(error);
                    });
                }).catch(error => {
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
}