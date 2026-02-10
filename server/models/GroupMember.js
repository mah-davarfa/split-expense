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
        trim:true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is not valid'],
    },
    inviteStatus:{
        type:String,
        enum:['pending','accepted','expired'],
        default:'pending',
        
    },
    inviteToken:{
        type:String,
        
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
///prevents from creating duplicat when in frontend user clicks 2 times
GroupMemberSchema.index(
  { groupId: 1, inviteEmail: 1 },
  { unique: true }
);
export default mongoose.model('GroupMember',GroupMemberSchema)