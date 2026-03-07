import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        match: [/^[^<>&]+$/, 'name  cannot contain <, >, or &'],
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is not valid'],
     },
    password: {
        type: String,
        required: true,
    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordTokenExpiration:{
        type:Date
    },
    profilePicture:{
        type:String,
        trim:true,
    },
    profilePicturePublicId: {
         type: String,
          default: "" 
        },

},
    {timestamps:true}
)
export default mongoose.model('User',UserSchema)