import { removeSessionForUser } from "../daos/session.dao.js";
import { getSessionsForUser, removeAllSessionsForUser   } from "../daos/session.dao.js";
import { store } from "#utils/redis.js";     

export const logoutService = async (userId, sessionId) => {
    if (!userId || !sessionId) return;

    // remove session id from Redis tracking set
    await removeSessionForUser(userId, sessionId);
};


export const logoutAllDevicesService = async (userId) => {
    const sessions = await getSessionsForUser(userId);

    // destroy each session in Redis
    await Promise.all(
        sessions.map(
            (sid) =>
                new Promise((resolve) => {
                    store.destroy(sid, () => resolve());
                })
        )
    );

    // remove all session ids from Redis tracking set
    await removeAllSessionsForUser(userId);
};
