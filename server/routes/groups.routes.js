import express from 'express';

import authToken from '../middlewares/auth.js'
import {getGroupsDashboard,creategroup} from '../controllers/groupsController.js';

const router = express.Router();

//POST /api/groups (create group)
router.post('/',authToken,creategroup)

//GET/api/groups (groups dashboard)
router.get('/',authToken,getGroupsDashboard)

export default router;