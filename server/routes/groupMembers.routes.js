import express from 'express';
const router= express.Router({mergeParams:true});
import {inviteUserToGroup,deletUserFromGroup, updateGroupSplitBulk} from '../controllers/groupMembersController.js';
import authToken from '../middlewares/auth.js';
import {requireGroupAdmin }from '../middlewares/groupAuth.js'
//POST /api/groups/:groupId/members
router.post('/',authToken,inviteUserToGroup)

//DELETE /api/groups/:groupId/members/:memberId 
router.delete('/:memberId',authToken,deletUserFromGroup)

//api/groups/:groupId/members/split (admin can edit the qual share or percentage)
router.put("/split", authToken, requireGroupAdmin, updateGroupSplitBulk);


export default router;