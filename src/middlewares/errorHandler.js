import ApiError from '#entities/ApiError.js';
import logger from '#utils/logger.js';
import { normalizePath } from '#utils/normalizePath.js';
import { NODE_ENV } from '#config/env.js';

export default function errorHandler(err, req, res, next) {
    let error = err;

    // Convert non-ApiError into ApiError
    if (!(err instanceof ApiError)) {
        const message = err?.message || 'Internal Server Error';
        error = new ApiError(500, message, err);
    }

    // Normalize internal property (code vs statusCode)
    error.code = error.statusCode;

    // Status codes that should not be logged
    const SHOULD_NOT_LOG = [400, 401, 403, 404];
    const skipLogging = SHOULD_NOT_LOG.includes(error.code);

    // Detect Prisma errors
    const isPrismaError =
        error.details?.name?.toLowerCase?.().includes('prisma') ||
        error.details?.message?.toLowerCase?.().includes('prisma') ||
        false;

    // Build clean stack
    let cleanStack = '';
    if (err.stack) {
        cleanStack = err.stack
            .split('\n')
            .filter(
                (line) =>
                    line.includes('src/') &&
                    !line.includes('node_modules') &&
                    !line.includes('(internal') &&
                    !line.includes('bootstrap_node')
            )
            .map((line) => normalizePath(line))
            .join('\n');
    }

    // Log only real errors
    if (!skipLogging || isPrismaError) {
        // Express logger
        logger.express.errorLogger(error, req, res, () => {});

        // Structured log
        logger.helpers.logError('API Error', {
            message: error.message,
            path: error.path,
            stack: cleanStack,
        });
    }

    // Send clean response
    res.status(error.code).json({
        success: false,
        code: error.code,
        message: error.message,
        path: error.path,
        stack: NODE_ENV === 'development' ? cleanStack : undefined,
    });
}
