import express from 'express';
const router= express.Router({mergeParams:true});
import {inviteUserToGroup,deletUserFromGroup} from '../controllers/groupMembersController.js';
import authToken from '../middlewares/auth.js';

//POST /api/groups/:groupId/members
router.post('/',authToken,inviteUserToGroup)

//DELETE /api/groups/:groupId/members/:memberId 
router.delete('/:memberId',authToken,deletUserFromGroup)

export default router;