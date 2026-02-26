
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js'
import mongoose from 'mongoose';
import crypto from 'crypto';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { sendInviteEmail } from "../config/emailService.js";
///Helper function

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

//POST /api/groups/:groupId/members(admin(creator of group)
// invites a member with email by using SendGrid, Mailgun, Resend, etc. )
export const inviteUserToGroup = async(req,res,next)=>{
   
    try{
       
        if(!req.user || !req.user.userId)
            return next(httpErrorHandler("Unauthorized: missing token payload", 401))

         const userId = req.user.userId;
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('the Id for user is not DB ID',400))

        const groupId = req.params.groupId;

        if(!groupId)
            return next(httpErrorHandler('The Id for Group is required', 400))
        if(!isIdValidMongooseId(groupId))
            return next(httpErrorHandler('teh ID is not DB Id for group', 400))

        const {email ,name} = req.body;
        if(name !==undefined){
            if(name.trim().length<2)
                return next(httpErrorHandler('Name must be more than 2 charaters',400))
        }
        if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            return next(httpErrorHandler('The correct Format Email required to send the invitation', 400))
        const inviteEmail= email.trim().toLowerCase()
        const groupInfo= await Group.findById(groupId).select('name description status')
        if(!groupInfo)
            return next(httpErrorHandler('The Group is not Availbe in database',404))
        if(groupInfo.status === 'inactive')
            return next(httpErrorHandler(`this group: ${groupInfo.name} is not active group , WRONG group`,400))

        const isAdminRequesting = await GroupMember.findOne({
            groupId,
            userId,
            role:'admin',
            inviteStatus:'accepted',
        })
        if(!isAdminRequesting)
            return next(httpErrorHandler('Forbidden: admin only can invites', 403))

        const hasUserBeenInvited = await GroupMember.findOne({
            groupId,
            inviteEmail,
            membershipStatus:'active'
         }) 
        if(hasUserBeenInvited){
            if(hasUserBeenInvited.inviteStatus === 'accepted')
                return next(httpErrorHandler('this member already added to group',400))
           }


/////////////////invitation token creates
        const inviteExpireAt = new Date(Date.now()+48*60*60*1000)
        const rawToken = crypto.randomBytes(32).toString('hex')
        const hashedToken= crypto.createHash('sha256').update(rawToken).digest('hex')
        let savedInvite;
        if(hasUserBeenInvited && (hasUserBeenInvited.inviteStatus === 'pending' || hasUserBeenInvited.inviteStatus === 'expired')){
            hasUserBeenInvited.role='member';
            hasUserBeenInvited.inviteStatus='pending';
            hasUserBeenInvited.inviteToken=hashedToken;
            hasUserBeenInvited.inviteExpireAt=inviteExpireAt;
            hasUserBeenInvited.invitedBy=userId;
            savedInvite= await hasUserBeenInvited.save()//prevent duplicate//
        }else{
                const invitedUserPending ={
                groupId,
                role:'member',
                inviteEmail,
                inviteStatus:'pending',
                inviteToken:hashedToken,
                inviteExpireAt,
                invitedBy:userId
                }
                savedInvite= await GroupMember.create(invitedUserPending)

        }

      
       
       // after setup Resend  send email whit the inviteLink in here ////////////////////////////////////////////////////////////////////////////
       // IMPORTANT: invite link must be a FULL URL for email
        const publicUrl = process.env.APP_PUBLIC_URL || "http://localhost:5173";
        const inviteUrl = `${publicUrl}/invite?token=${rawToken}`;
            const displayName = name?.trim() || inviteEmail;

            console.log("Resend key suffix:", (process.env.RESEND_API_KEY || "").slice(-6));
            console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

          let emailSent = false;
          let emailError = null;
        // send email
        try {
        await sendInviteEmail({
            to: inviteEmail,
            groupName: groupInfo.name,
            inviteUrl,
            invitedByName: req.user?.name, 
        });
        emailSent = true;
        } catch (e) {
        // don’t fail the whole invite if email provider has an outage
        // invite is already stored in DB as pending, so user can still use link
        emailError = e?.message || String(e);
        console.error("Invite email failed:", emailError);
        }
        return res.status(201).json({
            message: `Invitation sent to ${inviteEmail} (if email is valid)`,
            inviteUrl,
            emailSent,
            emailError,
            invite: {
                id:savedInvite._id,
                inviteEmail:savedInvite.inviteEmail,
                inviteStatus:savedInvite.inviteStatus,
                inviteExpireAt:savedInvite.inviteExpireAt,
            },
            
        })


    }catch(error){
        return next(error)
    }

}

//DELETE /api/groups/:groupId/members/:memberId (admin can delete one of the member from group)
export const deletUserFromGroup= async(req,res,next)=>{

    try{
        const {memberId,groupId} = req.params;
        if(!memberId || !groupId)
            return next(httpErrorHandler('the member id and group id are required,',400))
        if(!req.user || !req.user.userId)
            return next(httpErrorHandler('Unathorized',401))
        const userId = req.user.userId;
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('The Id is not DB ID',400))
       if(!isIdValidMongooseId(groupId))
            return next(httpErrorHandler('The Id is not DB ID',400))
        if(!isIdValidMongooseId(memberId))
            return next(httpErrorHandler('The Id is not DB ID',400))
        //////////DB //////
        const isAdminDelets = await GroupMember.findOne({
            groupId,
            userId,
            role:'admin',
            membershipStatus:'active'
        })
        if(!isAdminDelets)
            return next(httpErrorHandler('you are NOT authorize to DELETE or member is not in Group',403))

        const activityCount = await Expense.countDocuments({
            groupId,
            $or:[{createdBy:memberId},{paidBy:memberId}]
        })
       
        if(activityCount>0)
            return next(httpErrorHandler('this user has activity in group Do not delete',400))
        const deactivateUser= await GroupMember.findOne({
            groupId,
            userId:memberId,
            inviteStatus:'accepted',
            membershipStatus:'active'
        })
        if(!deactivateUser)
            return next(httpErrorHandler('User NOT found!',400))
///update GroupMember
        deactivateUser.membershipStatus='inactive';
        await deactivateUser.save();

        const group = await Group.findById(groupId)
        
        const user= await User.findById(memberId)

        res.status(200).json({
           message:`${user?.name || 'Member'} is inactiv from Group ${group?.name}`, 
           group: { id: groupId, name: group?.name, description: group?.description },
           member: { userId: memberId, name: user?.name, email: user?.email },
           })
       
    }catch(error){
        return next(error)
    }
}

//api/groups/:groupId/members/split (admin can edit the qual share or percentage)
//   {
//   "splitMode": "share",
//   "members": [
//     { "userId": "USER1_ID", "share": 1 },
//     { "userId": "USER2_ID", "share": 3 },
//     { "userId": "USER3_ID", "share": 2 }
//   ]
// }
//PUT /api/groups/:groupId/members/split (admin can edit the qual share or percentage in bulk mode)
export const updateGroupSplitBulk = async(req,res,next)=>{

    try{
        const groupId = req.params.groupId

        const { splitMode, members } = req.body;
        if(!splitMode || !['equal', 'percentage', 'share'].includes(splitMode))
            return next(httpErrorHandler('required:one of: equa, percentage, share',400))

        if(splitMode!=='equal'){
           if(!Array.isArray(members) || members.length ===0)
             return next(httpErrorHandler('to split required members',400))
        }

        ////////////DB ////////////

    const group =await Group.findById(groupId)
    if (!group)
        return next(httpErrorHandler('Group NOT found',404))
   
    if(splitMode === 'equal'){
        group.splitMode='equal';
        await group.save();
        await GroupMember.updateMany(
            {groupId},
            {$unset:{share:'', percentage:''}}
        );
        return res.status(200).json({
            message: "Split mode set to equal", group
        })
    }
    if(splitMode==="percentage"){
        const total= members.reduce((sum,m)=>sum+Number(m.percentage ?? 0),0)
        if(total !==100){
            return next(httpErrorHandler("Total percentage must equal 100",400))
        }
        for(const m of members) {
            const p = Number(m.percentage);
            if(!m.userId || !isIdValidMongooseId(m.userId) || Number.isNaN(p) || p>100 || p<0) {
                return next(httpErrorHandler('invalied member or percentage',400))
            }  
        }  
    }
    if(splitMode==='share'){
        for(const m of members){
            const p = Number(m.share);
            if(!m.userId || !isIdValidMongooseId(m.userId) || Number.isNaN(p) || p<0)
                return next(httpErrorHandler('invalide member or share',400))
        }
    }
    ///////updating to DB//////
    group.splitMode=splitMode
    await group.save();

//   {
//   "splitMode": "share",
//   "members": [
//     { "userId": "USER1_ID", "share": 1 },
//     { "userId": "USER2_ID", "share": 3 },
//     { "userId": "USER3_ID", "share": 2 }
//   ]
// }
    ///Model.bulkWrite([
//   { operationType: { filter, update } },
//   { operationType: { filter, update } }
// ])
//return {
//   updateOne: {
//     filter: { groupId, userId: m.userId },
//     update,
//   },
// };
    const createBulk= members.map((m=>{
        const update = splitMode === 'percentage'
                                    ? {$set:{percentage:Number(m.percentage)}, $unset:{share:''}}
                                    : {$set:{share:Number(m.share)},$unset:{percentage:''}};
        return {
            updateOne:{
                filter:{groupId , userId:m.userId, inviteStatus: "accepted", membershipStatus: "active"},
                update
            }
        }
    }))

    const result = await GroupMember.bulkWrite(createBulk);
    res.status(200).json({
        message:"Group split updated",
        result:result,
    })

    }catch(error){
       return next(error)

    }
}