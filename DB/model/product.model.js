import mongoose, { Schema, Types, model } from "mongoose";

const ProductSchema = new Schema({
    name: {
        type: String, required: true, unique: true, trim: true
    },
    slug: {
        type: String, required: true,
    },
    stock: {
        type: Number, default: 1
    }, price: {
        type: Number, required: true
    },
    description: {
        type: String, required: true
    },
    mainImage: { type: Object, required: true },
    finalPrice: {
        type: Number, required: true
    },
    size: {
        type: String, default: 'OneSize'
    },
    discount: {
        type: Number, default: 0
    },
    number_sellers: {
        type: Number, default: 0
    }
    ,
    createdByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true},
        userName: String
    },
    updatedByUser: {
        image: Object,
        _id: { type: Types.ObjectId, ref: 'User',required:true},
        userName: String
    },
    status: {
        type: String, enum: ['Active', 'Inactive'], default: 'Active'
    },
    expiredDate: {
        type: Date, required: true
    }
    ,
    categoryName: { type: String, required: true },
    isDeleted: {
        type: Boolean, default: false
    },
    categoryId: {
        type: Types.ObjectId, ref: 'Category', required: true
    }
  
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

ProductSchema.virtual("reviews",
    {
        localField: '_id',
        foreignField: 'productId',
        ref: 'Review'
    });
const ProductModel = mongoose.models.Product || model('Product', ProductSchema);
export default ProductModel;