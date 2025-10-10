import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import ApiResponse from '@entities/ApiResponse';
// import { test, dbTestRoute } from '@utils/test';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));
app.use(express.json());

//Testing routes
// test();
// dbTestRoute(app);

// console.log('Test function executed successfully');
// console.log('Environment Variables:', process.env.TEST);

app.use(express.urlencoded({ extended: true }));

app.get("/api/test",(req,res)=>{
    res.json(new ApiResponse({
        data : "Handshake done!!!!"
    }))
})



server.listen(PORT, async () => {
    app.use('/api', (await import('@src/core/router')).default);
    console.log(`Server is running on port ${PORT}`);
});
