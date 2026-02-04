import mongoose from 'mongoose';

const GroupSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
     createdBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
    },
     status:{
        type:String,
        enum:['active','deactive'],
        default:'active'
     }
},
{timestamps:true}
)
export default mongoose.model("Group",GroupSchema)