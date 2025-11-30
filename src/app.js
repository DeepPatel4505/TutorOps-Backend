// Load ENV first (must be first import)
import '#config/env.js';

// Libraries
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
// import session from 'express-session';

// Custom Modules
import ApiResponse from '#entities/ApiResponse.js';
import errorHandler from '#src/middlewares/errorHandler.js';
import appRouter from '#core/router.js';

// Configs
import { SESSION_SECRET, NODE_ENV } from '#config/env.js';
import logger from '#utils/logger.js';
import { dbTestRoute } from './utils/test';
import { testsetRedis } from '#utils/test';

// Redis Session
import { store, redisClient,session as redisSession } from '#utils/redis.js';

// Create app + server
const app = express();

// Redis Store
console.log("SESSION:", redisSession);

// Middlewaress
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//logging middlewares
app.use(logger.express.requestLogger);
app.use(logger.express.responseLogger);

// Sessions MUST come before CSRF
app.use(
    redisSession({
        store,
        name: 'tutorops_session',
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
    })
);

// Test Endpoint
testsetRedis(app, redisClient);
app.get('/test', (req, res) => {
    res.json(new ApiResponse({ data: 'Handshake done!!!!' }));
});
dbTestRoute(app);

// CSRF protection (after sessions)
app.use(csurf());

// Expose CSRF token route
app.get('/api/auth/csrf-token', (req, res) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
});

// App routes
app.use('/api', appRouter);

// Error handler
app.use(errorHandler);

export default app;
