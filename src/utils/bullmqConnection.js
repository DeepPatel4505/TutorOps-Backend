import Redis from "ioredis";
import { REDIS_URL } from "#src/config/env.js";
import logger from "./logger";

export const createBullmqConnection = () => {
    const connection = new Redis(REDIS_URL,{
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
    
    // Suppress error stack traces
    connection.on('error', (err) => {
        // Error consumed silently for BullMQ connection
        logger.base.error({ err }, "BullMQ Redis connection error (stack trace suppressed)");
    });
    
    return connection;  
};

