import express from 'express';

import authToken from '../middlewares/auth.js'
import {getGroupsDashboard} from '../controllers/groupsController.js';

const router = express.Router();

//GET/api/groups (groups dashboard)
router.get('/',authToken,getGroupsDashboard)

export default router;