import mongoose from 'mongoose';
///1-membership record (userId + groupId + role)
///2-invitation workflow (inviteEmail + inviteToken + inviteStatus + invitedBy)
const GroupMemberSchema= new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId , ref:'Group',
        required:true,
        
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
    membershipStatus:{
        type:String,
       enum:['active','inactive'],
       default:'active'
    },
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    share: { type: Number, min: 0, default: 1 },

    inviteExpireAt:{
        type:Date
    },
     invitedBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        
    }
},
{timestamps:true}
)
GroupMemberSchema.index(
  { groupId: 1, inviteEmail: 1 },
  { unique: true, sparse: true }
);

GroupMemberSchema.index(
  { groupId: 1, userId: 1 },
  { unique: true, sparse: true }
);

GroupMemberSchema.index(
  { inviteToken: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('GroupMember',GroupMemberSchema)