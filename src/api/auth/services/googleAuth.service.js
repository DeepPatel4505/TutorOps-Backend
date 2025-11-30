import { findUserByEmail, createGoogleUser } from "../daos/user.dao.js";
import { getGoogleUserFromCode } from '#utils/googleOAuth.js';

export const googleLoginService = async (googleUser) => {
    let user = await findUserByEmail(googleUser.email);

    if (!user) {
        user = await createGoogleUser(googleUser);
    }

    return user;
};

export const authenticateGoogleLogin = async (code) => {
    // This function should handle the exchange of the authorization code
    // for access tokens and retrieve user information from Google.
    // The implementation details depend on the specific OAuth2 library being used.
    // Below is a placeholder implementation.
    // Placeholder implementation
    const { googleUser } = await getGoogleUserFromCode(code);
    return googleUser;
};
