import mongoose, { Schema, Types, model } from "mongoose";

const FavoriteSchema = new Schema({
    userId: {
        type: Types.ObjectId, ref: 'User', required: true
    },
    products: [
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            price: { type: Number, required: true },
            mainImage: { type: Object, required: true },
            productName: { type: String, required: true },
            productSlug: { type: String, required: true }

        }
    ]
}, {
    timestamps: true
})

const FavoriteModel = mongoose.models.Favorite || model('Favorite', FavoriteSchema);
export default FavoriteModel;