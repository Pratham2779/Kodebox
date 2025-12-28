import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';


const app=express();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

// Middlewares

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(cookieParser());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({limit:'10mb',extended:true}));
app.use(express.static('public'));
app.use('/uploads',express.static(path.join(__dirname,'../public/uploads')));


// Routes




app.get('/',(req,res)=>{res.send("Hello from Kodebox!")});


// Error Handlers Middlewares
import { errorHandler } from './middlewares/errorHandler.middleware.js';


app.use(errorHandler);
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


export {app};






