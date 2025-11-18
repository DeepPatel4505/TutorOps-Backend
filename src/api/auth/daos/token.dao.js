import { TokenType } from "@utils/constant.js";

const createToken = async (
    tx,
    {
        userId,
        type,
        tokenHash,
        expiresAt,
        ipAddress = null,
        userAgent = null,
        deviceName = null,
        deviceType = null,
    }
) => {
    const newToken = await tx.refreshToken.create({
        data: {
            tokenHash,
            type,
            userId,
            expiresAt,
            ipAddress,
            userAgent,
            deviceName,
            deviceType,
        },
    });
    return newToken;
};

const createRefreshToken = async (tx, tokenData) => {
    return createToken(tx, { ...tokenData, type: TokenType.REFRESH });
};

const createPasswordResetToken = (tx, data) =>
    createToken(tx, { ...data, type: TokenType.RESET_PASSWORD });

const createEmailVerificationToken = (tx, data) =>
    createToken(tx, { ...data, type: TokenType.EMAIL_VERIFICATION });

export { createToken, createRefreshToken, createPasswordResetToken, createEmailVerificationToken };
