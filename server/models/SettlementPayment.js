import mongoose from 'mongoose';

const settlementPaymentSchema = new mongoose.Schema({
groupId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index:true,
},
fromUser:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index:true,
},
toUser:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index:true,
},
amount:{
    type: Number,
    required: true,
    min:0.01,
},
note:{
    type: String,
    trim: true,
    maxlength:100,
},
status: {
    type: String,
    enum:["paid","voided"],
    default:"paid",
    maxlength: 200
},
createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
voidedAt:{
    type: Date,
},
voidedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
},
voidedReason:{
    type: String,
    trim: true,
    maxlength: 200,
},

},
 { timestamps: true }
);
export default mongoose.model('SettlementPayment', settlementPaymentSchema);