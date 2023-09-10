import { config } from 'dotenv';
import express from 'express'
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

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



// Routes
app.get('/', (req, res) => {
    res.send("Hello Welcome to the backend of the CodeBuddy App😊");
});



// Defining port
const port = process.env.PORT || 5000;





app.listen(port, () => {
    console.log(`Server running on port ${port} 🔥`);
    console.log(`Frontend at ${process.env.FRONTEND_URL}`);
});