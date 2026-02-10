import express from 'express';
import memberRouter from './groupMembers.routes.js'
import authToken from '../middlewares/auth.js'
import {getGroupsDashboard,creategroup,getGroupWithMembers,updateGroup,inactiveGroup} from '../controllers/groupsController.js';

const router = express.Router();

//POST /api/groups (create group)
router.post('/',authToken,creategroup)

//GET/api/groups (groups dashboard)
router.get('/',authToken,getGroupsDashboard)

//GET /api/groups/:groupId (shows members)
router.get('/:groupId',authToken,getGroupWithMembers)

//PUT /api/groups/:groupId(edit one group if it is admin)
router.put('/:groupId',authToken,updateGroup)

//DELETE /api/groups/:groupId (inactive one group if it is admin)
router.delete('/:groupId',authToken,inactiveGroup)


///////////nested router from here for members//////////

router.use('/:groupId/members', memberRouter)


export default router;