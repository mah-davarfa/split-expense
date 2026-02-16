import mongoose from'mongoose';
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import Expense from '../models/Expense.js';



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

//GET /api/groups/:groupId/balances (balance sheet)
//GroupMembr-> {groupId, userId}->All active members and accepted member->Expense ->splitMode->
//  active expense createdBy
//total expense and total expenses per users
export const getGroupBalence = async(req,res,next)=>{

    try{
            const groupId= req.params?.groupId
            if(!groupId)
                return next(httpErrorHandler('the Grroup id required',400));
            if(!isIdValidMongooseId(groupId))
                return next(httpErrorHandler('the id is not DB id',400))
            
            const group= await Group.findById(groupId)
            if(!group)
                return next(httpErrorHandler("Group not found", 404))
            
           
            //if user is member of group, it has checked by middleware in Routes before gets here//
           
            const members= await GroupMember.find(
                {groupId,
                inviteStatus:'accepted',
                membershipStatus:'active'}
               )
              .select("userId percentage share")
              .populate('userId', 'name')
///the members=[ 
//        { _id: "gm1",
//             userId:{_id:u1 ,name:bob },
    //         percentage:0 , share:1
//        }, 
// {...} 
//]            
            if(!members.length)
                return next(httpErrorHandler('There is no activ member for this Group',400)) 
            
            const balances ={};
            /// create-> id:{userId:_id ,name:name ,balace:0}
           for(const m of members){
                const id = m.userId._id.toString()
                balances[id]={userId:m.userId._id, name:m.userId.name, balance:0}
           }
           
            const expenses= await Expense.find(
                {groupId,status:'active' }
            ).select('amount paidBy')
//[ { _id: "exp1", amount: 25, paidBy: "u1" },{...}]
            for(const ex of expenses){
                    const paidId= ex.paidBy.toString();
                    const amount = Number(ex.amount);

                    if(balances[paidId]) balances[paidId].balance +=amount;
                    
                    if(group.splitMode==='equal'){
                        const perPerson = amount / members.length;
                        
                        for(const m of members)
                        balances[m.userId._id.toString()].balance -=perPerson;
                    }
                
                    if(group.splitMode==='percentage'){
                        
                        for(const m of members){
                            const share =amount*(Number(m.percentage || 0)/100)
                            balances[m.userId._id.toString()].balance -=share  
                        }
                    }

                    if(group.splitMode==='share'){
                         let totalShare = 0;
                            for(const m of members){
                            totalShare +=Number(m.share ||0);
                            }
                        if (totalShare <= 0) return next(httpErrorHandler("Invalid share setup", 400));

                        for(const m of members){
                            balances[m.userId._id.toString()].balance -=amount*(m.share/totalShare ) 
                        }    
                    }
            }

            ////////////////////settelment who pays who//////////////////
                //id:{userId:_id ,name:name ,balace:0}
            const debtors =[];
            const creditors= [];

            for (const b of Object.values(balances)){

                const val = Number(b.balance)
                const rounded = Math.round(val*100)/100
                if(rounded>0) creditors.push({...b,amount: rounded});
                if(rounded<0) debtors.push({...b , amount: Math.abs(rounded)});
            }

            const settlment = [];
            let c=0;//index creditor
            let d=0; //index debtor

            while(c < creditors.length && d < debtors.length){
                const creditor = creditors[c];
                const debtor = debtors[d];

                const pay= Math.min(creditor.amount , debtor.amount)

                settlment.push({
                    fromUserId: debtor.userId,
                    fromName: debtor.name,
                    toUserId: creditor.userId,
                    toName: creditor.name,
                    amount: pay
                })
                debtor.amount = Math.round((debtor.amount - pay)*100)/100;
                creditor.amount = Math.round((creditor.amount - pay)*100)/100;
                if(debtor.amount === 0)d++;
                if(creditor.amount===0)c++;
            }


            /////////////////////////getting total for whole group and each user use aggregate pipline//////////////
            const totalGroupPaid= await Expense.aggregate([
                {
                    $match:{
                        groupId:new mongoose.Types.ObjectId(groupId),
                        status:'active'
                    }
                },
                {
                    $group:{
                        _id:null,
                        totalGroupPaid:{$sum:'$amount'}

                    }
                }
            ])


/////////////result is: [{ _id: null, totalAmount: 200 }]///

            const totalEachUserIdPaid= await Expense.aggregate([
                {
                    $match:{
                        groupId:new mongoose.Types.ObjectId(groupId),
                        status:'active'
                    }
                },
                {
                    $group:{
                        _id:'$paidBy',
                        totalEachUserIdPaid:{$sum:'$amount'}
                    }
                }
            ])
///result is like: [{ _id: "u1", totalPaid: 150 },{ _id: "u2", totalPaid: 90 },...]
            res.status(200).json({
                groupId,
                splitMode:group.splitMode,
                message:'if the balance is "-" meanes you paid less than others',
                balances:Object.values(balances),
                settlment,
                totalEachUserIdPaid,
                totalGroupPaid,
            })
            


            
    }catch(error){
        return next(error)
    }
}