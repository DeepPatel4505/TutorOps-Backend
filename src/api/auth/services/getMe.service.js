import { findUserById } from "../daos/user.dao.js";

export const getMe = async (req, res) => {
    const user = await findUserById(req.session?.user.id);
    console.log('getMe service invoked for user ID:', req.session?.user.id);
    console.log('User data retrieved:', user);
    return { user };
};
