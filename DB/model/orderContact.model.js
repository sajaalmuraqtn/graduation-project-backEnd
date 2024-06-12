import mongoose, { Schema, Types, model } from "mongoose";

const OrderContactSchema = new Schema({
    
    email: {
        type: String,
        required: true,
        unique: true
    },
    confirmEmail: {
        type: Boolean,
        default: false
    } ,
    phoneNumber: {
        type: String,
        trim: true,
        unique:true,
        min: 10,
        max: 10 
    } ,
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true },
        userName: String
    }
}, {
    timestamps: true
})

const OrderContactModel = mongoose.models.OrderContact || model('OrderContact', OrderContactSchema);
export default OrderContactModel;