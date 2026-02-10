import mongoose from 'mongoose';
///1-membership record (userId + groupId + role)
///2-invitation workflow (inviteEmail + inviteToken + inviteStatus + invitedBy)
const GroupMemberSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId , ref:'Group',
        required:true,
        unique:true,
        index:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId , ref:'User',
        index:true,
    },
    
    role:{
        type:String,
        enum:['admin','member'],
        default:'member',
        required:true,
    },
    inviteEmail:{
        type:String,
        trim:true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is not valid'],
        index:true,
        },
    inviteStatus:{
        type:String,
        enum:['pending','accepted','expired'],
        default:'pending',
        index:true
    },
    inviteToken:{
        type:String,
        index:true,
        unique:true,
        sparse:true,
        
    },
    inviteExpireAt:{
        type:Date
    },
     invitedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        
    }
},
{timestamps:true}
)
export default mongoose.model('GroupMember',GroupMemberSchema)