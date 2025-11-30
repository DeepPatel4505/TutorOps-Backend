import { Router } from 'express';
import ApiResponse from '#entities/ApiResponse.js';
import prisma from '#src/utils/prisma.js';
import { Redis } from 'ioredis';
import { REDIS_URL } from '#config/env.js';
import logger from '#utils/logger.js';

const router = Router();

// Health Check Endpoint
// GET /system/health
// curl -X GET http://localhost:3000/api/system/health
router.get('/health', async (req, res) => {
    logger.base.info('Health check requested');
    let dbStatus = 'up';
    let redisStatus = 'up';

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        dbStatus = 'down';
    }

    try {
        const redis = new Redis(REDIS_URL);
        await redis.ping();
        redis.disconnect();
    } catch {
        redisStatus = 'down';
    }

    logger.base.info(`Health check status - DB: ${dbStatus}, Redis: ${redisStatus}`);

    return res.json(
        new ApiResponse(
            {
                status: 'ok',
                uptime: process.uptime(),
                services: {
                    database: dbStatus,
                    redis: redisStatus,
                },
            },
            'System Health Status'
        )
    );
});

export default router;
