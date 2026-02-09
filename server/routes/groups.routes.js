import express from 'express';

import authToken from '../middlewares/auth.js'
import {getGroupsDashboard,creategroup,getGroupWithMembers} from '../controllers/groupsController.js';

const router = express.Router();

//POST /api/groups (create group)
router.post('/',authToken,creategroup)

//GET/api/groups (groups dashboard)
router.get('/',authToken,getGroupsDashboard)

//GET /api/groups/:groupId (shows members)
router.get('/:groupId',authToken,getGroupWithMembers)

export default router;