import ApiError from "#src/entities/ApiError.js";
import ApiResponse from "#src/entities/ApiResponse.js";
import { getMe } from "../services/getMe.service.js";

export const getMeController = async (req, res, next) => {
    try {
        //sessions are already validated by isAuthenticated middleware
        console.log('getMeController invoked');
        const result = await getMe(req, res);
        console.log('getMeController result:', result);
        return res.status(200).json(new ApiResponse(result, "User data fetched successfully"));
    } catch (err) {
        next(err);
    }
};
