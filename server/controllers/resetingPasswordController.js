import bcrypt from 'bcrypt';
import User from '../models/User.js';
import crypto from 'crypto';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);
const httpErrorHandler =(message,status)=>{
       const err = new Error(
        message
       )
       err.status=status;
       return err;
}
export const resetingPassword= async(req,res,next)=>{

    try{
        const {password,token}=req.body;
        

        if(!password || !token)
            return next(httpErrorHandler('password and token are required',400))
        if(password.trim().length<5)
            return next(httpErrorHandler('password must have at least 5 character!',400))

        const receivedHashToken = crypto.createHash('sha256').update(token).digest('hex')

        const userInfo = await User.findOne({forgotPasswordToken:receivedHashToken})
        
        if(!userInfo)
            return next(httpErrorHandler('Invalid or expaired reset token',404))

        const tokenExpiration=userInfo.forgotPasswordTokenExpiration;
        if (!tokenExpiration || Date.now() > tokenExpiration.getTime()) {
         userInfo.forgotPasswordTokenExpiration = null;
        userInfo.forgotPasswordToken='';

        await userInfo.save()
        return next(
            httpErrorHandler("Reset token expired. Please request a new one.", 401)
        );
        }

        
        const salt = await bcrypt.genSalt(SALT_ROUNDS);

        const hashedpassword = await  bcrypt.hash(password.trim(),salt)

        userInfo.password=hashedpassword;
        userInfo.forgotPasswordTokenExpiration = null;
        userInfo.forgotPasswordToken='';

        await userInfo.save()
       return  res.status(200).json({
            message:`information for ${userInfo.name} successfully updated`,
            name:userInfo.name,
         })
    }catch(err){
       return next(err)

    }

}