import mongoose from'mongoose'
///structured sub-documet
const ChatMessageSchema = new mongoose.Schema(
    {
        role:{
            type:String,
            enum:['user','assistant','system'],
            required:true,
        },
        content:{
            type:String,
            required:true,
            trim:true,
        },
    },
    {timestamps:true, _id:false}
);

const ChatSessionSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId, ref:'User',
            required:true,
            index:true,
            unique:true,
        },
        messages:{
            type:[ChatMessageSchema],
            default:[],
        }
    },
    {timestamps:true}
);
export default mongoose.model("ChatSession",ChatSessionSchema);