import mongoose, { Schema, Types, model } from "mongoose";

const ServiceSchema = new Schema({
    name: {
        type: String, required: true
    },
    slug: {
        type: String, required: true,
    },description:{
        type: String, required: true,
    },
    advertisementName:{
        type: String, required: true
    },
    advertisementId:{
            type: Types.ObjectId, ref: 'Advertisement'
     },
    mainImage: {
        type: Object
    }, price: {
        type: Number, required: true
    },
    discount: {
        type: Number, default: 0
    },
     finalPrice: {
        type: Number, required: true
    },
    status: {
        type: String, enum: ['Active', 'Inactive'], default: 'Active'
    },createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    },
    updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    },
    isDeleted: {
        type: Boolean, default: false
    }
}, {
    timestamps: true
})

const ServiceModel = mongoose.models.Service || model('Service',ServiceSchema);
export default ServiceModel;