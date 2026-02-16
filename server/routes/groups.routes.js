import express from 'express';
import memberRouter from './groupMembers.routes.js'
import authToken from '../middlewares/auth.js'
import {getGroupsDashboard,creategroup,getGroupWithMembers,updateGroup,inactiveGroup} from '../controllers/groupsController.js';
import expenseRouter from './expenses.routes.js'
import balanceRouter from './balances.routes.js'
const router = express.Router();

//POST /api/groups (create group)
router.post('/',authToken,creategroup)

//GET/api/groups (groups dashboard)
router.get('/',authToken,getGroupsDashboard)

//GET /api/groups/:groupId (shows members to active member of group)
router.get('/:groupId',authToken,getGroupWithMembers)

//PUT /api/groups/:groupId(edit one group if it is admin)
router.put('/:groupId',authToken,updateGroup)

//DELETE /api/groups/:groupId (inactive one group if it is admin)
router.delete('/:groupId',authToken,inactiveGroup)


///////////nested router from here for members//////////
//api/groups/:groupId/members
router.use('/:groupId/members', memberRouter)

///api/groups/:groupId/expenses
router.use('/:groupId/expenses',expenseRouter)

//api/groups/:groupId/balances
router.use('/:groupId/balances', balanceRouter)
export default router;