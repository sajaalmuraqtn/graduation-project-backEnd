 import mongoose, { Schema, Types, model } from "mongoose";

const PaymentMethodSchema = new Schema({ 
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User', required: true },
        userName: String,
        slug:String
    },
    cardDetails: {
        cardNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        cardType: {
            type: String,
            default:'visa' 
        },
        expiryDate: {
            type: String,
            required: true,
            trim: true,
            match: /^(0[1-9]|1[0-2])\/\d{2}$/
        },
        cvc: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{3,4}$/
        },
        cardholderName: {
            type: String,
            required: true,
            trim: true
        } 
    }
}, {
    timestamps: true
});

const PaymentMethodModel = mongoose.models.PaymentMethod || model('PaymentMethod', PaymentMethodSchema);
export default PaymentMethodModel;
