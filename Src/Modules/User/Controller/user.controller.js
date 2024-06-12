import slugify from "slugify";
import UserModel from "../../../../DB/model/user.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { pagination } from "../../../Services/pagination.js";
import ProductModel from "../../../../DB/model/product.model.js";
import CouponModel from "../../../../DB/model/coupon.model.js";
import CategoryModel from "../../../../DB/model/category.model.js";
import OrderContactModel from "../../../../DB/model/orderContact.model.js";
import OrderModel from "../../../../DB/model/order.model.js";
import ServiceModel from "../../../../DB/model/service.model.js";
import AdvertisementModel from "../../../../DB/model/advertisement.model.js";
import ContactSupportModel from "../../../../DB/model/contactSupport.js";


export const profile = async (req, res, next) => {
    const user = await UserModel.findById(req.user._id).populate('PaymentMethods');
    return res.status(201).json({ message: "success", user });
}

export const updateProfile = async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);

    if (req.body.userName) {
        if (await UserModel.findOne({ userName: req.body.userName.toLowerCase() }).select('userName')) {
            return next(new Error("userName already exist", { cause: 409 }));
        }
        user.userName = req.body.userName.toLowerCase();
        user.slug = slugify(user.userName);

        if (user.role == "Admin") {
            await ProductModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await ProductModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await CouponModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await CouponModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await CategoryModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await CategoryModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await OrderContactModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await OrderModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await ServiceModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await ServiceModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await AdvertisementModel.updateMany(
                { "createdByUser._id": req.user._id }, // Filter products by old username
                { $set: { "createdByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await AdvertisementModel.updateMany(
                { "updatedByUser._id": req.user._id }, // Filter products by old username
                { $set: { "updatedByUser.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
            await ContactSupportModel.updateMany(
                { "repliedBy._id": req.user._id }, // Filter products by old username
                { $set: { "repliedBy.userName": req.body.userName.toLowerCase() } } // Update username to new username
            );
        }

    }
        if (req.body.phoneNumber) {
            user.phoneNumber = req.body.phoneNumber;
        }

        if (req.body.address) {
            user.address = req.body.address;
        }


        if (req.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.APP_NAME}/User`
            })
            await cloudinary.uploader.destroy(user.image.public_id);
            user.image = { secure_url, public_id };
            if (user.role == "Admin") {
                await ProductModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await ProductModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await CouponModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await CouponModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await CategoryModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await CategoryModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await OrderContactModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await OrderModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await ServiceModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await ServiceModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await AdvertisementModel.updateMany(
                    { "createdByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "createdByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await AdvertisementModel.updateMany(
                    { "updatedByUser._id": req.user._id }, // Filter products by old username
                    { $set: { "updatedByUser.image": { secure_url, public_id } } } // Update username to new username
                );
                await ContactSupportModel.updateMany(
                    { "repliedBy._id": req.user._id }, // Filter products by old username
                    { $set: { "repliedBy.image": { secure_url, public_id } } } // Update username to new username
                );
            }
        }

        await user.save()

        return res.status(201).json({ message: "success", user });
    }


    export const getAllUsers = async (req, res, next) => {
        const { limit, skip } = pagination(req.query.page, req.query.limit);

        let queryObj = { ...req.query };
        const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
        execQuery.map((ele) => {
            delete queryObj[ele];
        })
        queryObj = JSON.stringify(queryObj);
        queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
        queryObj = JSON.parse(queryObj);
    
        const mongooseQuery = UserModel.find(queryObj).limit(limit).skip(skip);
        if (req.query.search) {
            mongooseQuery.find({
                $or: [
                    { userName: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } }
                ]
            });
        }
        if (req.query.fields) {
            mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
        }

        const users = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).find({ role: 'User' });
        return res.status(201).json({ message: 'success', users });
    }

    export const getSpecificUser = async (req, res, next) => {
        const { userId } = req.params;
        const user = await UserModel.findById(userId).populate('PaymentMethods');
        if (!user) {
            return next(new Error(` user not found `, { cause: 404 }));
        }
        if (user.role !== 'User') {
            return next(new Error("invalid authorization", { cause: 400 }));
        }
        return res.status(200).json({ message: 'success', user })
    }

    export const getUnConfirmedUsers = async (req, res, next) => {
        const { limit, skip } = pagination(req.query.page, req.query.limit)

        const users = await UserModel.find({ confirmEmail: 'false', role: 'User' }).limit(limit).skip(skip);
        if (!users) {
            return next(new Error(`error while fetching data`, { cause: 400 }));
        }
        return res.status(200).json({ message: 'success', count: unConfirmedUsers.length, users });

    }
    export const getActiveUsers = async (req, res, next) => {
        const { limit, skip } = pagination(req.query.page, req.query.limit)

        const users = await UserModel.find({ confirmEmail: 'true', role: 'User' }).limit(limit).skip(skip);
        if (!users) {
            return next(new Error(`error while fetching data`, { cause: 400 }));
        }
        return res.status(200).json({ message: 'success', count: users.length, users });
    }