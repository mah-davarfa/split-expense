import express from "express"
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middlewares/errorHandler.js'
import signin from "./controllers/authController.js"
import signup from './controllers/signupController.js'

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN
const app = express();
app.use(express.json());
app.use(helmet());
app.use(
    cors({
    origin:FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    allowedHeaders: ["Content-Type", "Authorization"]
    })
)
 const authLimiter=rateLimit({
    windowMs:12*60*60*1000,//12 hours window
    limit:100,
    standardHeaders:'draft-7',
    legacyHeaders:false,
    message:"Too many request from this IP , pleas try again later"
 })

// / Landing
app.get('/',(req,res)=>{
    res.json({message:"API is running"})
})
// /signup
app.use('/signin',authLimiter,signin)
// /login
app.use('/signup',authLimiter,signup)

// /app/groups (groups dashboard)
// /app/groups/new (create group)
// /app/groups/:groupId (group detail expenses)
// /app/groups/:groupId/members (members/invites)
// /app/groups/:groupId/balances (balance sheet)
// /app/settings (profile/settings)

//////orute Not Found////
app.use((req,res)=>{
    res.status(404).json({error: 'Route not found'})
})
///Error Handler
app.use(errorHandler);

export default app;