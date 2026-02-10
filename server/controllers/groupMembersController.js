
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js'
import mongoose from 'mongoose';
import crypto from 'crypto';

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

      
       const inviteLink = `/invite?token=${rawToken}`
       // after setup Resend  send email whit the inviteLink in here ////////////////////////////////////////////////////////////////////////////
        const displayName = name?.trim() || inviteEmail;
        const inviteMessage = `${displayName} invited to join: ${groupInfo.name}`;


        res.status(201).json({
            message:`the invetition for ${displayName}  sent to ${email} and ${displayName}  added to pending status till ${displayName}  accepet it by login or sign up `,
            inviteMessage,
            inviteLink
            })

    }catch(error){
        return next(error)
    }

}