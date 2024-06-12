import mongoose, { Schema, Types, model } from "mongoose";
import multer from "multer";

const OrderSchema = new Schema({
    userId: {
        type: Types.ObjectId, ref: 'User', required: true
    }, products: [{
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        quantity: { type: Number, default: 1, required: true },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, required: true },
        finalPrice: { type: Number, required: true }
    }],
    contact: {
        _id: { type: Types.ObjectId, ref: 'Contact' },
        adminPhoneNumber: { type: String, unique: true }
        , adminEmail: { type: String, unique: true }
    },
    finalPrice: {
        type: Number, required: true
    },
    city: {
        type: String,
        enum: ['Hebron', 'Nablus', 'Jerusalem', 'Ramallah', 'Tulkarm', "Jenin", "Al-Bireh", "Jericho", "Yatta", "Beit Jala"]
        , required: true
    },
    firstName: {
        type: String, required: true
    },
    lastName: {
        type: String, required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String, required: true
    },
    couponName: {
        type: String,
        default: ''
    },
    paymentType: {
        type: String, default: 'cash',
        enum: ['cash', 'visa' ] 
    }, cardDetails: {
        cardNumber: {
            type: String,
             unique: true,
            trim: true
        },
        cardType: {
            type: String  
        },
        expiryDate: {
            type: String,
             trim: true,
            match: /^(0[1-9]|1[0-2])\/\d{2}$/
        },
        cvc: {
            type: String,
             trim: true,
            match: /^[0-9]{3,4}$/
        },
        cardholderName: {
            type: String,
             trim: true
        } ,
        cardId:{
            type: Types.ObjectId, ref: 'PaymentMethod' 
        }
    },
    status: {
        type: String, default: 'pending',
        enum: ['pending', 'cancelled', 'confirmed', 'onWay', 'delivered']
    },
    reasonRejected: String,
    note: String
    ,
    updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User' },
        userName: String
    }
}, {
    timestamps: true
})



const OrderModel = mongoose.models.Order || model('Order', OrderSchema);
export default OrderModel;