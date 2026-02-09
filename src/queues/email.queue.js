import { Queue } from "bullmq";
import { createBullmqConnection }  from "#src/utils/bullmqConnection.js";

export const EMAIL_QUEUE_NAME = "EMAIL_QUEUE";
export const EMAIL_QUEUE_PREFIX = "tutorops:email";
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
    connection: createBullmqConnection(),
    prefix: EMAIL_QUEUE_PREFIX,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
    },
});