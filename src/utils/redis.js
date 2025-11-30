import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { REDIS_URL } from '#config/env.js';
import logger from '#utils/logger.js';

function configureRedis() {
    const redisClient = new Redis(REDIS_URL);

    const RedisStore = connectRedis(expressSession);

    const store = new RedisStore({
        client: redisClient,
        prefix: 'tutorops:',
    });

    let MaxAttempts = 5;
    redisClient.on('error', (err) => {
        err = {}
        logger.base.error({ err }, ' Redis connection error');
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

    return { store, redisClient, session: expressSession };
}

export const { store, redisClient, session } = configureRedis();