import express from "express"
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middlewares/errorHandler.js'
import signin from "./controllers/authController.js"
import signup from './controllers/signupController.js'
import groupsRouter from './routes/groups.routes.js'
import inviteRouter from './routes/invites.routes.js'
import aiRouter from './routes/ai.routes.js'


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
 const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many AI requests. Try again later." },
});

// / test Landing
app.get('/',(req,res)=>{
    res.json({message:"API is running"})
})
// /signup
app.post('/signin',authLimiter,signin)
// /login
app.post('/signup',authLimiter,signup)




//////mounted paths //////
//POST /api/ai/assistant
app.use('/api/ai',aiLimiter,aiRouter)
//POST /api/invites/accept { token } 
app.use('/api/invites', inviteRouter)

//POST /api/groups (create group)DONE
//GET /api/groups (shows groups and user info Dashbord)DONE
//GET /api/groups/:groupId (shows members)DONE
//PUT /api/groups/:groupId(edit one group if it is admin)DONE
//DELETE /api/groups/:groupId (inactive one group if it is admin)DONE
app.use('/api/groups',groupsRouter)

//////members controller is nested in Group controller////////////
//POST /api/groups/:groupId/members(admin(creator of group)invites a member with email by using SendGrid, Mailgun, Resend, etc. )DONE
//DELETE /api/groups/:groupId/members/:memberId (admin can delete one of the member from group)DONE
//api/groups/:groupId/members/split (admin can edit the qual share or percentage)DONE
//   {
//   "splitMode": "share",
//   "members": [
//     { "userId": "USER1_ID", "share": 1 },
//     { "userId": "USER2_ID", "share": 3 },
//     { "userId": "USER3_ID", "share": 2 }
//   ]
// }

//////expenses controler ////////
//POST/api/groups/:groupId/expenses (add expense to lists of expense(optional picture of recipt))DONE
//GET /api/groups/:groupId/expenses(group detail expenses) DONE
//GET /api/groups/:groupId/expenses?me=true(user detail expenses)DONE
//PUT /api/groups/:groupId/expenses/:expensesId (edit one of it's own expense)DONE
//DELETE /api/groups/:goupId/expenses/:expensesId (DELETE one of it's own expense)DONE

//GET /api/groups/:groupId/balances (balance sheet)DONE

////setting controller//////
//GET /api/user/settings (profile/settings)
//PUT /api/user/settings(editing profile)
//PUT /api/user/settings/profile-picture
//PUT /api/user/password




//////orute Not Found////
app.use((req,res)=>{
    res.status(404).json({error: 'Route not found'})
})
///Error Handler
app.use(errorHandler);

export default app;