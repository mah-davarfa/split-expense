import mongoose from 'mongoose';

const GroupSchema= new mongoose.Schema({
    name:{
        type:String,
        minlength:3,
        required:true,
        trim:true
    },
    description:{
        type:String,
        minlength:5,
        required:true,
        trim:true
    },
     createdBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true,
    },
     status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
     }
},
{timestamps:true}
)
GroupSchema.index({ createdBy: 1 });
export default mongoose.model("Group",GroupSchema)