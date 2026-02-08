import User from '../models/User.js';
import Group from '../models/Group.js';
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

//POST /api/groups (create group)
export const creategroup = async(req,res,next)=>{
    try{
        if(!req.user || !req.user.userId)
            return next(httpErrorHandler("Unauthorized: missing token payload", 401));

        const {name,description}=req.body;
        if(!name ||!description)
            return next(httpErrorHandler('To create a Group name and description are required',400));

        if(name.length<3  || description.length<5)
            return next(httpErrorHandler('name must have more than 3 characters and description must be more than 5 characters',400));
        

        const userId = req.user.userId;
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('The Id is not DB ID',400))
       
        const creatorOfGroup= await User.findById(userId)
        if(!creatorOfGroup)
            return next(httpErrorHandler("User not found", 404))

        const newGroup={
            name:name.trim(),
            description:description.trim(),
            createdBy:creatorOfGroup._id,
            status:'active'
        }
        const createdGroup = await Group.create(newGroup);

        const newGroupMember={
            groupId:createdGroup._id,
            userId:creatorOfGroup._id,
            role:'admin',
            inviteStatus:'accepted',
            invitedBy: creatorOfGroup._id,
        }
        await GroupMember.create(newGroupMember);
        res.status(201).json({
            message:'New Group created',
            createdGroup
        })

    }catch(error){
        return next(error)
    }
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


