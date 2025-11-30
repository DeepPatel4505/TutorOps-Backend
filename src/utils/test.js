import prisma from '#src/utils/prisma.js';

// Simple test function
export const test = () => {
    console.log('Test function');
};

// New function to test Prisma connection
// curl.exe -X GET http://localhost:3000/test-db
export const dbTestRoute = (app) => {
    app.get('/test-db', async (req, res) => {
        try {
            const users = await prisma.user.findMany(); // assuming User model exists
            res.json({
                message: '✅ Prisma client working!',
                users,
            });
        } catch (error) {
            console.error('❌ Prisma Error:', error);
            res.status(500).json({ error: 'Prisma connection failed' });
        }
    });
};

// curl -X GET http://localhost:3000/test-redis
export const testsetRedis = (app, redisClient) => {
    app.get('/test-redis', async (req, res) => {
        try {
            console.log("Testing Redis Client:", redisClient.status);
            await redisClient.set('test-key', 'Hello, Redis!');
            const value = await redisClient.get('test-key');
            res.json({
                message: '✅ Redis client working!',
                value,
            });
        } catch (error) {
            console.error('❌ Redis Error:', error);
            res.status(500).json({ error: 'Redis connection failed' });
        }
    });
};
