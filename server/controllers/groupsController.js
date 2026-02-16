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

        if(name.length<2  || description.length<5)
            return next(httpErrorHandler('name must have more than 2 characters and description must be more than 5 characters',400));
        

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
            membershipStatus:'active'
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
            inviteStatus:'accepted',
        })
            .select("groupId role")
            .populate('groupId','name description createdBy status createdAt');
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

//GET /api/groups/:groupId (shows members)
export const getGroupWithMembers= async(req,res,next)=>{

    try{
    
    if(!req.user || !req.user.userId)
            return next(httpErrorHandler("Unauthorized: missing token payload", 401)) 
     const userId = req.user.userId;   
    if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('the Id is not DB ID',400)) 

    const groupId = req.params.groupId;
    if(!groupId)
        return next(httpErrorHandler('The Id for Group is required', 400))
    
    if(!isIdValidMongooseId(groupId))
        return next(httpErrorHandler('teh ID is not DB Id for group', 400))

    const group= await Group.findById(groupId)
    if(!group)
        return next(httpErrorHandler('group is not exicte in DataBase',404))

    const isUserInGroup = await GroupMember.findOne({
        groupId:group._id,
        userId,
        inviteStatus: 'accepted',
        membershipStatus:'active'
    })
    if(!isUserInGroup)
        return next(httpErrorHandler('UnAuthorize: access Denid may be you left this group before',403))

    const membersOfGroup= await GroupMember.find({groupId:group._id})
        .select("userId inviteStatus createdAt role membershipStatus")
        .populate("userId","name profilePcture")   
    res.status(200).json({
        group,
        membersOfGroup
    })    
    }catch(error){
        return next(error)
    }
} 

//PUT /api/groups/:groupId(edit one group  if it is admin)
export const updateGroup = async (req,res,next)=>{
   
   try{
    const userId=req.user?.userId
    if(!userId)
        return next(httpErrorHandler("Unauthorized", 401))

    if(!isIdValidMongooseId(userId))
        return next(httpErrorHandler('teh ID is not DB Id for user', 400))

    const groupId = req.params?.groupId;
    if(!groupId)
        return next(httpErrorHandler('the Group Id is required',400))

    if(!isIdValidMongooseId(groupId))
        return next(httpErrorHandler('teh ID is not DB Id for group', 400))

    const isAdminRequesting= await GroupMember.findOne({
        groupId,
        userId,
        role:'admin',
        inviteStatus: "accepted",
        membershipStatus:'active'
    })
    if(!isAdminRequesting)
        return next(httpErrorHandler('Forbidden: admin only', 403))

    const isGroupExist = await Group.findById(groupId)
    if(!isGroupExist)
        return next(httpErrorHandler('Group is not exist to update',404))

    const {name,description,status}= req.body;
    
    const updateData={}
    if(name !== undefined){
        if(name.trim().length<2)
            return next(httpErrorHandler('Name must be more than 2 charaters',400))
     updateData.name = name.trim()   
    }
    if(description !== undefined){
        if(description.trim().length<5)
            return next(httpErrorHandler('Description must be more than 5 characters',400))
      updateData.description = description.trim()  
    }
    if(status !==undefined){
        const allowed=['active','inactive']
        if(!allowed.includes(status))
            return next(httpErrorHandler('status only can be either active or inactive',400))
        updateData.status=status;
    }
    if(Object.keys(updateData).length === 0)
        return next(httpErrorHandler("Nothing to update", 400))

    const updatedGroup= await Group
       .findByIdAndUpdate(groupId, updateData,{new:true ,runValidators:true})
    res.status(200).json({
        message:'group updated',
        updatedGroup
    })   

   }catch(error){
    return next(error)
   }
}

//DELETE /api/groups/:groupId (inactive one group if it is admin)
export const inactiveGroup = async (req,res,next)=>{
    try{
     const userId=req.user?.userId
    if(!userId)
        return next(httpErrorHandler("Unauthorized", 401))

    if(!isIdValidMongooseId(userId))
        return next(httpErrorHandler('teh ID is not DB Id for user', 400))

    const groupId = req.params?.groupId;
    if(!groupId)
        return next(httpErrorHandler('the Group Id is required',400))

    if(!isIdValidMongooseId(groupId))
        return next(httpErrorHandler('teh ID is not DB Id for group', 400))

    const isAdminRequesting= await GroupMember.findOne({
        groupId,
        userId,
        role:'admin',
        inviteStatus: "accepted",
        membershipStatus:'active'
    })
    if(!isAdminRequesting)
        return next(httpErrorHandler('Forbidden: admin only', 403))

    const isGroupExist = await Group.findById(groupId)
    if(!isGroupExist)
        return next(httpErrorHandler('Group is not exist to update',404))  
     const newUpdate = {status:'inactive'}
    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        newUpdate,
        {new: true, runValidators : true}
    )   
    res.status(200).json({
        message:"Group is inactive",
        updatedGroup
    })  
    }catch(error){
        return next(error)
    }
}
