import mongoose from 'mongoose';
///1-membership record (userId + groupId + role)
///2-invitation workflow (inviteEmail + inviteToken + inviteStatus + invitedBy)
const GroupMemberSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId , ref:'Group',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId , ref:'User',
        
    },
    
    role:{
        type:String,
        enum:['admin','member'],
        default:'member',
        required:true,
    },
    inviteEmail:{
        type:String,
        
    },
    inviteStatus:{
        type:String,
        enum:['pending','accepted','expired'],
        default:'pending',
        
    },
    inviteToken:{
        type:String,
        
    },
     invitedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        
    }
},
{timestamps:true}
)
export default mongoose.model('GroupMember',GroupMemberSchema)