import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';



const httpErrorHandler =(message,status)=>{
    const err = new Error (
        message,
    )
    err.status=status
    return err;
}

const logIn = async (req,res,next)=>{

    const {email,password}=req.body;

    if(!email || !password)
        return next(httpErrorHandler('email and password are required', 400))

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()))
        return next(httpErrorHandler('Email Format is not valid', 400))

    
    const user = await User.findOne({email:email.trim().toLowerCase()})
         if(!user)
            return next(httpErrorHandler('Email or password Not Found',404))
        
    const hashedPassword= user.password;
        try{
            const  isVerifiedPassword = await  bcrypt.compare(password, hashedPassword)
            if(!isVerifiedPassword)
            return    res.status(403).json({
                    message:'Access Denied'
            })
        }catch(err){
            next(err)
        }
    const payload ={
        userId:user._id,
        name:user.name,
        email:user.email,
    }    
    const token = generateToken(payload)
    res.status(200).json({message:'successfully loged in', token:token})
}
export default logIn;