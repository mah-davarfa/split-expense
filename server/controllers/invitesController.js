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


//POST /api/invites/accept { token } //user clicks the link-> front saves token in session ->login-> front fetch here//
export  const addInvitedUserToGroupByUsingInviteTokenLink= async (req,res,next)=>{

    try{
        if(!req.user || !req.user.userId || !req.user.email)
            return next(httpErrorHandler("Unauthorized: missing token payload or email or userId", 401))
            const {userId,email} = req.user;
            if(!isIdValidMongooseId(userId))
                return next(httpErrorHandler('the Id for user is not DB ID',400))

            if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                    return next(httpErrorHandler('The correct Format Email required to send the invitation', 400))
          
            const rawTokenfromUrl = req.body.token
                if(!rawTokenfromUrl)
                    return next(httpErrorHandler('the invited token is missing', 400))    
          
            const hashTokenFromUrl= crypto.createHash('sha256').update(rawTokenfromUrl).digest('hex');
                 ////////////////Database query///////////////
            const getInvitedUserByHash = await GroupMember.findOne({inviteToken:hashTokenFromUrl, inviteStatus: 'pending'})
            if(!getInvitedUserByHash)
                    return next(httpErrorHandler('this Token is not valid',400))
                
            const invitedEmail= email.trim().toLowerCase()
            if(invitedEmail!==getInvitedUserByHash.inviteEmail)
                return next(httpErrorHandler('this Email is not valid',400))
            
            if(!getInvitedUserByHash.inviteExpireAt|| getInvitedUserByHash.inviteExpireAt.getTime()< Date.now())
                return next(httpErrorHandler('this token has expire! required new invitation to be added to this Group',400))                
           
            if (getInvitedUserByHash.userId) {
                return next(httpErrorHandler('Invite already associated with a user', 400));
                }
            //////////updating db/////
            getInvitedUserByHash.userId=userId;
            getInvitedUserByHash.role='member';
            getInvitedUserByHash.inviteStatus='accepted';
            getInvitedUserByHash.inviteExpireAt=undefined;
            getInvitedUserByHash.inviteToken=undefined;
            const userAddedtoMembership= await getInvitedUserByHash.save()
                ///verify added//
            const groupName = await Group.findById(userAddedtoMembership.groupId).select('name')
            
        res.status(200).json({
            message:'user added to Group',
            GroupId:userAddedtoMembership.groupId,
            groupname:groupName?.name,
        })




    }catch(error){
        return next(error)
    }
}