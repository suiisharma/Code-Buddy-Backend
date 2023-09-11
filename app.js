import { config } from 'dotenv';
import express from 'express'
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './routes/userRoutes.js';

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

app.use("/",router)

// Routes
app.get('/', (req, res) => {
    res.send("Hello Welcome to the backend of the CodeBuddy App😊");
});



// Defining port
const port = process.env.PORT ;

app.listen(port, async() => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log(`Server running on port ${port} 🔥`);
    console.log(`Frontend at ${process.env.FRONTEND_URL} 🚀`);
});