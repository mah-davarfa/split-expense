import GroupMember from "../models/GroupMember.js";
import mongoose from 'mongoose'

const isIdValidMongooseId = (id)=>{
    return mongoose.isValidObjectId(id)
}

const httpErrorHandler = (message,status)=>{
    const error = new Error (
        message
    )
    error.status=status;
    return error;
}

export const requireGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.userId;
            
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if(!isIdValidMongooseId(userId))
        return next(httpErrorHandler('The Id is not DB ID',400))
    if(!groupId)
      return next(httpErrorHandler('Group id is required',400))
    if(!isIdValidMongooseId(groupId))
      return next(httpErrorHandler('The Id is not DB ID',400))
    const membership = await GroupMember.findOne({
      groupId,
      userId,
      inviteStatus: "accepted",
      membershipStatus: "active",
    });

    if (!membership) {
      return res.status(403).json({ message: "Forbidden: not a group member" });
    }

    
    req.groupMember = membership;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireGroupAdmin = async (req, res, next) => {
  try {
        if(!req.user || !req.user.userId)
            return next(httpErrorHandler( "Unauthorized",401))
        const userId =req.user.userId;
        if(!isIdValidMongooseId(userId))
            return next(httpErrorHandler('The Id is not DB ID',400))
        
        if(!req.params.groupId)
            return next(httpErrorHandler('Group Id is required',400))
        const groupId = req.params.groupId;
        if(!isIdValidMongooseId(groupId))
            return next(httpErrorHandler('the id is not Db id',400))

    const membership = await GroupMember.findOne({
      groupId,
      userId,
      inviteStatus: "accepted",
      membershipStatus: "active",
      role: "admin",
    });

    if (!membership) {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    req.groupAdmin = membership;
    next();
  } catch (err) {
    next(err);
  }
};
