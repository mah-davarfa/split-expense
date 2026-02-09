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
        profilePcture:{
            type:String,
            trim:true,
            
        },
        phone: {
            type: String,
            required: true,
            unique:true,
            trim: true,
            match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number format"]
        },
},
    {timestamps:true}
)
export default mongoose.model('User',UserSchema)