import User from '../models/User.js'
import crypto from 'crypto';
import { sendEmailToResetPassword } from "../config/emailServiceResetPassword.js";

    const httpErrorHandler = (message,status)=>{
    const error = new Error (
        message
    )
    error.status=status;
    return error;
}

export const forgotPasswordEmailTokenController = async(req,res,next)=>{
    
    try{
            const {email} = req.body;
            if(!email)
                return next(httpErrorHandler('correct Email is requires',400))

            const cleanEmail = email.trim().toLowerCase();

            if( typeof cleanEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
                return next(httpErrorHandler('correct Email is requires',400))
            

            const userEmail = await User.findOne({email:cleanEmail});
                if (!userEmail) {
                    return res.status(200).json({
                        message: "If that email exists, reset instructions were sent.",
                    });
                    }
            ////////////creating token with expiration////////////////
            const expiration = new Date(Date.now()+5*60*1000)//5 minuts from now
            ///create token///
            const rawToken =crypto.randomBytes(32).toString('hex');
            const hashToken = crypto.createHash('sha256').update(rawToken).digest('hex')
                   
            userEmail.forgotPasswordToken=hashToken;
            userEmail.forgotPasswordTokenExpiration=expiration;
        await userEmail.save()

        ////sending email
        const publicUrl = process.env.APP_PUBLIC_URL || "http://localhost:5173";
        const resetUrl= `${publicUrl}/reset-password?token=${rawToken}`;

        try{
            await sendEmailToResetPassword({
            to: userEmail.email,
            resetUrl  
            })
        }catch(err){
            console.log(err)
        }

        return res.status(200).json({
            message: "If that email exists, reset instructions were sent."
            });
    }catch(error){
        return next(error)
    }


}