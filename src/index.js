import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
// import { test, dbTestRoute } from '@utils/test';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Testing routes
// test();
// dbTestRoute(app);

// console.log('Test function executed successfully');
// console.log('Environment Variables:', process.env.TEST);

app.use(express.urlencoded({ extended: true }));



server.listen(PORT, async () => {
    app.use('/api', (await import('@src/core/router')).default);
    console.log(`Server is running on port ${PORT}`);
});
