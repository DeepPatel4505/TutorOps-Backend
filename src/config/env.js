import dotenv from 'dotenv';
dotenv.config();

export const {
    NODE_ENV,
    PORT = 3000,
    FRONTEND_URL,
    BACKEND_URL,
    DATABASE_URL,
    AI_API_KEY,
    SESSION_SECRET,
    REDIS_URL,
} = process.env;