import mongoose, { Schema, Types, model } from "mongoose";

const CouponSchema = new Schema({
    name: {
        type: String, required: true, unique: true
    },
    slug:{
        type: String, required: true
    },
    amount: {
        type: Number, required: true
    },
    image: {
        type: Object, required: true
    },

    usedBy: [
        {
        type: Types.ObjectId, ref: 'User'
        }
    ],
    isDeleted: {
        type: Boolean, default: false
    }
    ,
    expiredDate: {
        type: Date, required: true
    },
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true },
        userName: String
    },
    updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    }
}, {
    timestamps: true
})



const CouponModel = mongoose.models.Coupon || model('Coupon', CouponSchema);
export default CouponModel;