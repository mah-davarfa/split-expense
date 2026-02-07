import User from '../models/User.js';

import GroupMember from '../models/GroupMember.js';

import mongoose from 'mongoose';

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

//GET/api/groups (groups dashboard)
export const getGroupsDashboard = async (req,res,next)=>{

    try{
        if(!req.user || !req.user.userId)
            return next(httpErrorHandler("Unauthorized: missing token payload", 401))
        const userId = req.user.userId;
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('the Id is not DB ID',400))
        const dbUser = await User.findById(userId)
            .select("name email")
        if(!dbUser)
            return next(httpErrorHandler("user is not exist in database", 404))    
        const memberships= await GroupMember
        .find({
            userId,
            inviteStatus:'accepted'
        })
        .select("groupId role")
        .populate('groupId','name description createdAt');
      res.status(200).json({
        user:{
            name:dbUser.name,
            email:dbUser.email
        },
       memberships
      })  

    }catch(error){
        return next(error)
    }
}


