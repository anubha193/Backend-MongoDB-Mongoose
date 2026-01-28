import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//import routers
import userRouter from './routes/user.route.js';
import videoRoute from './routes/video.route.js';

//use routers for users
app.use("/api/v1/users", userRouter);

//use routers for videos
app.use("/api/v1/videos", videoRoute);

export { app };

