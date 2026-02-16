import express from 'express'
import {getGroupBalence} from '../controllers/groupBalanceController.js'
import {requireGroupMember} from '../middlewares/groupAuth.js'
import authToken from '../middlewares/auth.js';
const router = express.Router({mergeParams:true});

//GET /api/groups/:groupId/balances (balance sheet)
router.get('/',authToken,requireGroupMember,getGroupBalence);

export default router;