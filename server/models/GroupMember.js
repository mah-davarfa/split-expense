import mongoose from 'mongoose';

const GroupMemberSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId , ref:'Group',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId , ref:'User',
        required:true
    },
    inviteEmail:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','member'],
        default:'member',
        required:true,
    },
    inviteStatus:{
        type:String,
        enum:['pending','accepted','expired'],
        default:'pending',
        required:true
    },
    inviteToken:{
        type:String,
        required:true,
    },
     invitedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true
    }
},
{timestamps:true}
)
export default mongoose.model('GroupMember',GroupMemberSchema)