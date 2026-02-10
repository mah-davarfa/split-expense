import express from 'express';
const inviteRouter = express.Router()
import {addInvitedUserToGroupByUsingInviteTokenLink} from '../controllers/invitesController.js';
import authToken from '../middlewares/auth.js';

//POST /api/invites/accept { token }
inviteRouter.post('/accept',authToken,addInvitedUserToGroupByUsingInviteTokenLink)
export default inviteRouter;