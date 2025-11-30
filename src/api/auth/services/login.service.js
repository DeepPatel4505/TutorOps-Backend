import { findUserByEmail, verifyUserPassword } from "../daos/user.dao.js";
import ApiError from "#entities/ApiError.js";

export const loginService = async ({ email, password }) => {
    // 1. Find user
    const user = await findUserByEmail(email);
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 2. Validate password
    const valid = await verifyUserPassword(user, password);
    if (!valid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 3. Return minimal user data for session
    return {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
    };
};
