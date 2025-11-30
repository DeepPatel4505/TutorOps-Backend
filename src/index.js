import http from "http";
import app from "./app.js";
import { PORT, NODE_ENV } from "#config/env.js";
import logger from "#utils/logger.js";

process.on("unhandledRejection", (reason) => {
    logger.base.error({ reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (err) => {
    logger.base.fatal({ err }, "UNCAUGHT EXCEPTION - Server crashed");
    process.exit(1); // mandatory for uncaught exceptions
});

process.on("RedisNotConnected", (err) => {
    err.showStack = false;
    logger.base.error({ err }, "Server Stopped - Redis Not Connected");
    // logger.express.errorLogger(err, {}, {}, () => {}, false);
    process.exit(1); // mandatory for uncaught exceptions
});

// Start server inside a protective wrapper
function startServer() {
    try {
        const server = http.createServer(app);

        server.listen(PORT, () => {
            logger.base.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
        });

        // Graceful Shutdown Handling
        process.on("SIGINT", () => shutdown(server, "SIGINT"));
        process.on("SIGTERM", () => shutdown(server, "SIGTERM"));

        return server;

    } catch (err) {
        logger.base.error({ err }, "❌ FATAL STARTUP ERROR — Server crashed before boot");
        process.exit(1);
    }
}

function shutdown(server, signal) {
    logger.base.warn(`⚠️ Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
        logger.base.info("🛑 HTTP server closed");
        process.exit(0);
    });

    // Force quit if shutdown hangs
    setTimeout(() => {
        logger.base.error("❗ Forcing shutdown");
        process.exit(1);
    }, 5000);
}

startServer();
