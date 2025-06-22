import express from "express";
import { config } from "dotenv";
import cors from "cors";
import http from "http";
import { test } from "@utils/test";
import { log } from "console";

config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

test();
console.log("Test function executed successfully");
console.log("Environment Variables:", process.env.TEST);

app.use(express.urlencoded({ extended: true }));


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


