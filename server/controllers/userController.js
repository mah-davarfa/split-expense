import User from '../models/User.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';

///Helper function

const httpErrorHandler = (message,status)=>{
    const error = new Error (
        message
    )
    error.status=status;
    return error;
}

const isIdValidMongooseId = async(id)=>{
    return mongoose.isValidObjectId(id)
}

//get access to user peofile , edit 
// /api/settings (profile/settings)
const getUserAccount = async(req,res,next)=>{

}