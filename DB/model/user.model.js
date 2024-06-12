import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique:true,
        min: 4,
        max: 20,
    },
    slug: {
        type: String,
        required: true,
        unique:true,
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
    address: {
        type: String
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
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    sendCode: {
        type: String,
        default: null
    },
    changePasswordTime: {
        type: Date
    }

}, {
    timestamps: true
})

UserSchema.virtual("PaymentMethods",
    {
        localField: '_id',
        foreignField: 'createdByUser.userId',
        ref: 'PaymentMethod'
    });

const UserModel = mongoose.models.User || model('User', UserSchema);
export default UserModel;