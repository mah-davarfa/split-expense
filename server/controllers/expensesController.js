import Group from '../models/Group.js';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/User.js';

///Helper function

const httpErrorHandler = (message,status)=>{
    const error = new Error (
        message
    )
    error.status=status;
    return error;
}

const isIdValidMongooseId = (id)=>{
    return mongoose.isValidObjectId(id)
}

const isUserIsAdminOfMemberOfGroup= async(userId,groupId)=>{
    try{
          const membership = await GroupMember.findOne({
          groupId,
          userId,
          inviteStatus: "accepted",
          membershipStatus: "active",
          role: "admin",
        });
      
            return membership;
    } catch (error) { 
        throw error;
     }
    }





//POST/api/groups/:groupId/expenses (add expense to lists of expense(optional picture of recipt))
export const addExpense = async(req,res,next)=>{

        try{
            //{description,amount,expensedate,picture}=req.body;

            const groupId = req.params.groupId
            if (!groupId) return next(httpErrorHandler("Group Id is required", 400));

            const userId= req.user.userId;
            if (!userId) return next(httpErrorHandler("Unauthorized", 401));
            //userId and groupid would be veryfy in route by middleware

            const description= req.body?.description?.trim();
            if(!description)
                return next(httpErrorHandler('The discription to add expense is required',400))
            if(description.length <3)
                return next(httpErrorHandler('the dicsription need to be more than 3 characters',400))

            const amount = Number(req.body?.amount)
            if ( Number.isNaN(amount)|| amount<0)
                return next(httpErrorHandler("a valide number >=0  for amount is required!",400))

            const newExpenseDate = req.body?.expenseDate ? new Date(req.body.expenseDate) : new Date();
            if(Number.isNaN(newExpenseDate.getTime()))
                return next(httpErrorHandler('Date format is wrong',400))

            let recieptUrl = [];
            if(req.body?.receiptUrl){recieptUrl=  Array.isArray(req.body?.receiptUrl) ? req.body.receiptUrl :[req.body.receiptUrl]  }


            const newExpenses={
                groupId,
                createdBy:userId,
                paidBy:userId,
                description,
                amount,
                expenseDate:newExpenseDate,
                receiptUrl:recieptUrl
            }
            const created = await Expense.create(newExpenses)
            res.status(201).json({
                message:'new Expense Added ',
                created
            })
        }catch(error){
             return next(error)   
            }
}

//GET /api/groups/:groupId/expenses (group detail expenses)
export const getExpenses = async(req,res,next)=>{
    try{
            const groupId= req.params.groupId;
    if(!groupId)
        return next(httpErrorHandler('in order to get expenses groupId is required',400));
    const expenses = await Expense.find({groupId}).sort({expenseDate:-1,createdAt:-1});
    res.status(200).json({
        expenses
    })

    }catch(error){
        return next(error)
    }

}

//PUT /api/groups/:goupId/expenses/:expensesId (edit one of it's own expense)
export const editOneExpense = async(req,res,next)=>{
    
    try{
        
        const userId= req.user?.userId;
        if(!userId)
            return next(httpErrorHandler('Unauthorize access',401))
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('the Id is NOT DB id',400))
        
        const {groupId, expensesId}= req.params;
    
        if(!groupId)
        return next(httpErrorHandler('in order to get expenses groupId is required',400));
        if(!isIdValidMongooseId(groupId))
            return next(httpErrorHandler('groupId id is not DB id',400))

        if(!expensesId)
            return next(httpErrorHandler('the expense id is required',400));
        if(!isIdValidMongooseId(expensesId))
            return next(httpErrorHandler('the expense id is not DB id',400));

       // const {description, amount, expenseDate, recepitUrl}= req.body;
       const updateExpense={};
      
        if(req.body?.description !== undefined) {
            const description=req.body.description?.trim();
            if(description.length <3){
            return next (httpErrorHandler("the description must be more than 3 characters",400));
             }else{
               updateExpense.description = description;
             }
        }

        if ( req.body?.amount !== undefined){
            const amount = Number(req.body.amount)
                if(Number.isNaN(amount) || amount <0 ){
                        return next(httpErrorHandler("a valide number >=0  for amount is required!",400))
                }else{
                    updateExpense.amount=amount;
                }
        }

        if(req.body?.expenseDate !==undefined){
            const expenseDate= new Date(req.body.expenseDate)
            if(Number.isNaN(expenseDate.getTime())){
                return next(httpErrorHandler('Date format is wrong',400))
            }
            updateExpense.expenseDate=expenseDate;
        }

        if(req.body?.receiptUrl !== undefined){
            const receiptUrl= Array.isArray(req.body.receiptUrl)? req.body.receiptUrl: [req.body.receiptUrl]
            updateExpense.receiptUrl=receiptUrl;
        }

        if(Object.keys(updateExpense).length === 0 )
            return next(httpErrorHandler('Nothing To Update',400))

        const updatedExpenses= await Expense.findOneAndUpdate(
            {_id:expensesId,groupId,createdBy:userId},
            updateExpense,
            {new:true,runValidators:true}
        )
        if (!updatedExpenses)
            return next(httpErrorHandler('the expenses is not found or Not own by you',404))

        res.status(200).json({
            message:'the expense successfully updated',
            updatedExpenses
        })
    }catch(error){
        return next(error)
    }
}