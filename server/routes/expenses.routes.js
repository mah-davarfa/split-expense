import express from 'express'
import {requireGroupMember} from '../middlewares/groupAuth.js'
import authToken from '../middlewares/auth.js';
import {addExpense,editOneExpense,getExpenses,voideOneexpense} from '../controllers/expensesController.js'
const router = express.Router({mergeParams:true});

//POST/api/groups/:groupId/expenses
router.post('/',authToken,requireGroupMember,addExpense)

//GET /api/groups/:groupId/expenses (group detail expenses)
//GET /api/groups/:groupId/expenses?me=true(my detail expenses)
router.get('/',authToken,requireGroupMember,getExpenses)

//PUT /api/groups/:groupId/expenses/:expensesId (edit one of it's own expense)
router.put('/:expensesId',authToken,requireGroupMember,editOneExpense)

//DELETE /api/groups/:goupId/expenses/:expensesId (VOID one of it's own expense)
router.delete('/:expensesId',authToken,requireGroupMember,voideOneexpense)

export default router;