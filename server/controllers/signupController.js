import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const SALT_ROUNDS= Number(process.env.SALT_ROUNDS || 10);


//helper function
const httpErrorHandler =(message,status)=>{
       const err = new Error(
        message
       )
       err.status=status;
       return err;
}

const signup = async(req,res, next)=>{
    const {name ,email ,password , phone,}= req.body;

    if(!name || !email || !password || !phone)
      return next(httpErrorHandler('name,email,password,phone are required !', 400));
   
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()))
      return next(httpErrorHandler('Email format is not valid', 400));
    
    if(!/^[^<>&]+$/.test(name.trim()))
      return next(httpErrorHandler('name  cannot contain <, >, or &',400));
    
    if(!/^\+?[1-9]\d{7,14}$/.test(phone.trim()))
        return next(httpErrorHandler("Invalid phone number format",400))
    
    const user = await  User.findOne({email:email.trim().toLowerCase()})
    if(user)
        return next(httpErrorHandler('email is already exist',409))

    const SALT = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password.trim(),SALT);
    
    const newUser =  {
        name:name,
        email:email,
        password:hashedPassword,
        phone:phone
    }
   
   try{
    const user= await User.create(newUser)

    
     const payload= {
      userId:user._id,
        name:user.name,
        email:user.email,
     }
    const token= generateToken(payload)

    res.status(201).json({message:"sinup succesfully", token:token,user: { userId: user._id, name: user.name, email: user.email }})

   }catch(err){
    next(err)
   }
}
export default signup;