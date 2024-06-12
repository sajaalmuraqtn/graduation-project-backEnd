import mongoose, { Schema, Types, model } from "mongoose";

const ContactSupportSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    title:{
        type: String, required: true
    },
   message:{
    type: String, required: true
   } ,
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true },
        userName: String,
        slug:String
    } ,
     replied: {
        type: Boolean, default: false
    },
    replay:{
        type: String 
    },
    repliedBy: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User'},
        userName: String,
        slug:String
    } ,
}, {
    timestamps: true
})

const ContactSupportModel = mongoose.models.ContactSupport || model('ContactSupport', ContactSupportSchema);
export default ContactSupportModel;