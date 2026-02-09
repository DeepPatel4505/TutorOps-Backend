import bcrypt from 'bcryptjs';
import { findUserByEmail, storeOtpHash,getOtpRecord, markEmailAsVerified, deleteOtpRecord  } from '../daos/user.dao';
import { enqueueVerificationEmail } from '#src/services/email/email.producer.js';
import ApiResponse from '#entities/ApiResponse.js';
import ApiError from '#entities/ApiError.js';
import { addSessionForUser} from '../daos/session.dao.js';

export const sendOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json(new ApiResponse({ message: 'User not found' }));
        }

        if (user.isVerified) {
            return res.status(400).json(new ApiResponse({ message: 'Email is already verified' }));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otphash = await bcrypt.hash(otp, 10);

        await storeOtpHash(user.id, otphash, new Date(Date.now() + 10 * 60 * 1000));

        //push otp to email service here
        console.log(`Generated OTP for ${email}: ${otp}`);
        await enqueueVerificationEmail(user.id, email, otp);

        return res.status(200).json(new ApiResponse({ message: 'OTP sent to email' }));
    } catch (error) {
        next(error);
    }
};

export const verifyOtpController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json(new ApiResponse({ message: 'Email and OTP are required' }));
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json(new ApiResponse({ message: 'User not found' }));
        }

        delete user.password; // Ensure password is not sent to client

        if (user.isVerified) {
            return res.status(400).json(new ApiResponse({ message: 'Email is already verified' }));
        }

        const otpRecord = await getOtpRecord(user.id);

        if (!otpRecord) {
            return res.status(400).json(new ApiResponse({ message: 'OTP not found or expired' }));
        }

        if(new Date() > otpRecord.expiry) {
            await deleteOtpRecord(user.id);
            return res.status(400).json(new ApiResponse({ message: 'OTP has expired' }));
        }

        const isValidOtp = await bcrypt.compare(otp, otpRecord.otphash);
        if (!isValidOtp) {
            return res.status(400).json(new ApiResponse({ message: 'Invalid OTP' }));
        }

        await markEmailAsVerified(user.id);
        await deleteOtpRecord(user.id);

        req.session.regenerate(async (err) => {
            if (err) return next(new ApiError(500, 'Session regeneration failed', err));
            // Store only minimal info in session
            req.session.user = {
                id: user.id,
                role: user.role,
            };
            const sid = req.sessionID;
            // Persist session in DB
            await addSessionForUser(user.id, sid);

            return res.status(200).json(new ApiResponse({ user }, 'Email verification successful'));
        });

    } catch (error) {
        next(error);
    }
};
