import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { REDIS_URL } from '#config/env.js';
import logger from '#utils/logger.js';

let sharedRedisClient = null;

function configureRedis() {
    if (sharedRedisClient) {
        return sharedRedisClient;
    }


    const redisClient = new Redis(REDIS_URL);

    const RedisStore = connectRedis(expressSession);

    const store = new RedisStore({
        client: redisClient,
        prefix: 'tutorops:',
    });

    let MaxAttempts = 5;
    redisClient.on('error', (err) => {
        logger.base.error({}, ' Redis connection error');
        // Error is consumed to prevent default stack trace logging
    });

    redisClient.on('connect', () => {
        logger.base.info('Redis connected');
    });

    redisClient.on('reconnecting', () => {
        MaxAttempts--;
        logger.base.warn('Redis reconnecting...');
        if (MaxAttempts <= 0) {
            process.emit("RedisNotConnected", new Error('Max Redis reconnection attempts reached'));
        }
    });

    sharedRedisClient = { store, redisClient, session: expressSession };
    return sharedRedisClient;
}

export const { store, redisClient, session } = configureRedis();