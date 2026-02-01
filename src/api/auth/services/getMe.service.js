import { findUserById } from "../daos/user.dao.js";

export const getMe = async (req, res) => {
    const user = await findUserById(req.session?.user.id);
    return { user };
};
