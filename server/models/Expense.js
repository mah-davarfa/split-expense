import mongoose from 'mongoose';

const ExpenseSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId, ref:'Group',
        required:true,
    },
    ceaditedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
    },
    paidBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
    },
    description:{
        type:String,
        minlength:3,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
        min:0,
    },
    expenseDate:{
        type:Date,
        required:true,
    },
    receiptUrl:{
        type:[stering],
        default:[]
    }
    
},
{timestamps:true}
)
export default mongoose.model('Expense',ExpenseSchema)