import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import prisma from "@utils/prisma";
import ApiError from "../../../entities/ApiError";
import { findUserByEmail } from "../daos/login.dao";

const googleCallback = async (req, res, next) => {
    try {
        const state = req.query.state
            ? JSON.parse(decodeURIComponent(req.query.state))
            : {};

        if (!req.query.code) {
            return res.redirect(process.env.FRONTEND_URL);
        }

        const { user } = await authenticateGoogleLogin(req.query.code);
        if (!user) {
            return res.redirect(process.env.FRONTEND_URL);
        }

        const data = await googleLogin(user);
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("refresh_token", data.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "Strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.redirect(`${process.env.FRONTEND_URL}${state.from || "/"}`);
    } catch (error) {
        next(new ApiError(500, "Google login failed", error, "auth/googleCallback"));
    }
};

const authenticateGoogleLogin = async (code) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.BACKEND_URL}/auth/google-callback`,
    });

    const { data: tokenResponse } = await axios.post(
        "https://oauth2.googleapis.com/token",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { data: userData } = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
    );

    return { access_token: tokenResponse.access_token, user: userData };
};

const googleLogin = async (googleUser) => {
    let user = await findUserByEmail(googleUser.email);
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: googleUser.email,
                name: googleUser.name,
                isVerified: true,
                isPasswordSet: false,
                password: crypto.randomUUID(), // placeholder since user signs in via Google
            },
        });
    }

    const access_token = signAccessToken(user.id, user.email, user.role);
    const refresh_token = signRefreshToken(user.id, user.email, user.role);

    return { user, access_token, refresh_token };
};

const signAccessToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );
};

const signRefreshToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

export { googleCallback };
