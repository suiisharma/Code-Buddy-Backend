import { config } from 'dotenv';
import express from 'express'
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRoutes.js';
import postRouter from "./routes/postsRoutes.js"
import commentRouter from "./routes/commentRoutes.js"
import messageRouter from "./routes/messagesRouter.js"
import communitiesRouter from './routes/communitiesRouter.js';

const app = express();


//setting up env variables
config({
    path: "./config.env",
});

//Parsing cookies
app.use(cookieParser());

//Middlewares 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,

}));
app.set('view engine','ejs');
// Routes
app.use("/auth",userRouter)
app.use("/posts",postRouter)
app.use("/comments",commentRouter)
app.use("/communities",communitiesRouter)
app.use("/messages",messageRouter)
// Defining port
const port = process.env.PORT ;

app.listen(port, async() => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log(`Server running on port ${port} 🔥`);
    console.log(`Frontend at ${process.env.FRONTEND_URL} 🚀`);
});