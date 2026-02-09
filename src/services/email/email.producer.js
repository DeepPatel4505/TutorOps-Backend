import { emailQueue } from "#src/queues/email.queue.js"

export const enqueueVerificationEmail = async (
    userId,
    email,
    otp,
) => {
    console.log("Enqueuing verification email:", { userId, email, otp });
    return emailQueue.add("SEND_VERIFICATION_EMAIL", {
        userId,
        email,
        otp,
    }
);
};
