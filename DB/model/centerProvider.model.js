import mongoose, { Schema, Types, model } from "mongoose";

const CenterProviderSchema = new Schema({
    centerProviderName: {
        type: String,
        required: true,
        unique: true,
        min: 4,
        max: 20,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        min: 4,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },  
    confirmEmail: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    }, 
    phoneNumber: {
        type: String,
        trim: true,
        min: 10,
        max: 10
    },
    image: {
        type: Object,
        required: true,
    }
    , 
    expiredDate: {
        type: Date, required: true
    } ,
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    }, updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    }
}, {
    timestamps: true
})

CenterProviderSchema.virtual("Advertisements",
    {
        localField: '_id',
        foreignField: 'createdByUser.userId',
        ref: 'Advertisement'
    });

const CenterProviderModel = mongoose.models.CenterProvider || model('CenterProvider', CenterProviderSchema);
export default CenterProviderModel;