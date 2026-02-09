import {Worker} from "bullmq";
import {sendVerificationEmail} from "#src/services/email/email.service.js";
import {createBullmqConnection} from "#src/utils/bullmqConnection.js";
import {EMAIL_QUEUE_NAME, EMAIL_QUEUE_PREFIX} from "#src/queues/email.queue.js";
import  logger  from "#utils/logger.js";
const helpers = logger.helpers;
const { logError, logSystemEvent, logWarning, ...otherLogs } = helpers;

logSystemEvent(`Email worker starting for queue: ${EMAIL_QUEUE_NAME}`);
const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
        try {
            switch (job.name) {
                case "SEND_VERIFICATION_EMAIL":{
                    const { userId, email, otp } = job.data;
                    await sendVerificationEmail({email, otp});
                    break;
                }
                default:{
                    logWarning(`Unknown job name: ${job.name}`);
                }
            }
        } catch (error) {
            throw new Error(`Unknown error processing job (${job.name}): ${error.message}`); // Re-throw to let BullMQ handle retries
        }
    },
    {
        connection: createBullmqConnection(),
        concurrency: 5, // Process up to 5 jobs concurrently
        prefix: EMAIL_QUEUE_PREFIX,
    }
);

worker.on("ready", () => {
    logSystemEvent(`Email worker is ready and listening for jobs on queue: ${EMAIL_QUEUE_NAME}`);
});

worker.on("active", (job) => {
    logSystemEvent(`Job started: ${job.id} (${job.name})`);
});

worker.on("completed", (job) => {
    logSystemEvent(`Job completed: ${job.id} (${job.name})`);
});

worker.on("failed", (job, err) => {
    logError(`Job failed: ${job.id} (${job.name}) - Error: ${err.message}`);
});

worker.on("error", (err) => {
    logError(`Worker error: ${err.message}`);
});



