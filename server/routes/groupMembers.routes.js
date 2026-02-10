import express from 'express';
const router= express.Router();
import {inviteUserToGroup} from '../controllers/groupMembersController.js';
import authToken from '../middlewares/auth.js';

//POST /api/groups/:groupId/members
router.post('/',authToken,inviteUserToGroup)

export default router;