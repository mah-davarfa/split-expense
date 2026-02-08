import express from "express"
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middlewares/errorHandler.js'
import signin from "./controllers/authController.js"
import signup from './controllers/signupController.js'
import groupsRouter from './routes/groups.routes.js'


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
    message:{error:"Too many request from this IP , pleas try again later"}
 })

// / test Landing
app.get('/',(req,res)=>{
    res.json({message:"API is running"})
})
// /signup
app.post('/signin',authLimiter,signin)
// /login
app.post('/signup',authLimiter,signup)


app.use('/api/groups',groupsRouter)
//POST /api/groups (create group)DONE
//GET /api/groups (shows groups and user info Dashbord)DONE
//PUT /api/groups/:groupId(edit one group at same page if it is admin)
//DELETE /api/groups/:groupId (DELETE one group if it is admin)

//POST /api/groups/:groupId/members(admin(creator of group)invites with a member with email by using SendGrid, Mailgun, etc. )
//GET /api/groups/:groupId/members (shows members)
//DELETE /api/groups/:groupId/members/:memberId (delete one of the member if it is admin)
//PUT /api/groups/:groupId/members/:memberId (admin can edit the qual share or percentage)

//POST/api/groups/:groupId/expenses (add expense to lists of expense(optional picture of recipt))
//GET /api/groups/:groupId/expenses (group detail expenses)
//PUT /api/groups/:goupId/expenses/:expensesId (edit one of it's own expense)
//DELETE /api/groups/:goupId/expenses/:expensesId (DELETE one of it's own expense)

//GET /api/groups/:groupId/balances (balance sheet)

//GET /api/user/settings (profile/settings)
//PUT /api/user/settings(editing profile)
//PUT /api/user/password

//POST /api/invites/accept { token } 

//////orute Not Found////
app.use((req,res)=>{
    res.status(404).json({error: 'Route not found'})
})
///Error Handler
app.use(errorHandler);

export default app;