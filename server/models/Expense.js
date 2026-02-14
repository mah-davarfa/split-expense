import mongoose from 'mongoose';

const ExpenseSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId, ref:'Group',
        required:true,
        index:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
        index:true,
    },
    paidBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
    },
    description:{
        type:String,
        minlength:3,
        required:true,
        trim:true,
    },
    amount:{
        type:Number,
        required:true,
        min:0,
    },
    expenseDate:{
        type:Date,
        required:true,
        index:true,
    },
    receiptUrl:{
        type:[String],
        default:[]
    },
    status: {
   type: String,
   enum: ['active', 'voided'],
   default: 'active'
    },
    voidedAt:{
        type:Date,
    },
    voidedReason:{
        type:String,
        minlength:3,
        trim:true,
    },
    voidedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        
    }
    
},
{timestamps:true}
)
export default mongoose.model('Expense',ExpenseSchema)