import mongoose, { Schema, Types, model } from "mongoose";

const AdvertisementSchema = new Schema({
    name: {
        type: String, required: true, unique: true, trim: true
    },
    slug: {
        type: String, required: true,
    },
    phoneNumber: {
        type: String, required: true,
    },
    address: {
        type: String, required: true,
    },
    facebookLink:{
        type: String
    },
    instagramLink:{
        type: String
    },
    description: {
        type: String, required: true
    },
    mainImage: {
        type: Object, required: true
    }
    ,
    status: {
        type: String, enum: ['Active', 'Inactive'], default: 'Active'
    }, 
    expiredDate: {
        type: Date, required: true
    },
    isDeleted: {
        type: Boolean, default: false
    },
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    },
    updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true  },
        userName: String
    },
    city:{
        type:String,
        enum:['Hebron','Nablus','Jerusalem','Ramallah','Tulkarm',"Jenin","Al-Bireh","Jericho","Yatta","Beit Jala"]
        ,required:true
     }
},  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
AdvertisementSchema.virtual('Services', {
    localField: '_id',
    foreignField: 'advertisementId',
    ref: 'Service'
});




const AdvertisementModel = mongoose.models.Advertisement || model('Advertisement', AdvertisementSchema);
export default AdvertisementModel;