import ApiError from '#entities/ApiError.js';

const zodValidator = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.parseAsync(req.body);
        next();
    } catch (error) {
        // Check if it's a ZodError
        const message = error?.errors?.[0]?.message || error.message || 'Validation failed';
        next(new ApiError(422, message, error, `${req.originalUrl}\\middlewares\\validate`));
    }
};

export default zodValidator;
