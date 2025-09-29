import prisma from '@utils/prisma.js';

// Simple test function
export const test = () => {
  console.log("Test function");
};

// New function to test Prisma connection
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
});};