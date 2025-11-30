// src/api/auth/daos/session.dao.js
import { redisClient } from '#utils/redis.js'; // <- path to where you export redisClient

export const addSessionForUser = async (userId, sessionId) =>
    redisClient.sadd(`user_sessions:${userId}`, sessionId);

export const removeSessionForUser = async (userId, sessionId) =>
    redisClient.srem(`user_sessions:${userId}`, sessionId);

export const getSessionsForUser = async (userId) => redisClient.smembers(`user_sessions:${userId}`);

export const removeAllSessionsForUser = async (userId) => {
    const sessions = await getSessionsForUser(userId);
    const pipeline = redisClient.pipeline();
    sessions.forEach((sessionId) => pipeline.srem(`user_sessions:${userId}`, sessionId));
    await pipeline.exec();
};