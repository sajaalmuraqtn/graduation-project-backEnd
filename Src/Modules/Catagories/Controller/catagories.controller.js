import slugify from "slugify";

import CategoryModel from "../../../../DB/model/category.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { pagination } from "../../../Services/pagination.js";
import ProductModel from "../../../../DB/model/product.model.js";
import UserModel from "../../../../DB/model/user.model.js";

export const getCatagories = async (req, res, next) => {
    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = CategoryModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { 'createdByUser.userName': { $regex: req.query.search, $options: 'i' } },
                { 'updatedByUser.userName': { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const categories = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).populate('Products');
    return res.status(201).json({ message: 'success', categories })
}

export const getSpecificCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const category = await CategoryModel.findOne({ _id: categoryId }).populate('Products');
    if (!category) {
        return next(new Error(` category not found `, { cause: 404 }));
    }
    return res.status(200).json({ message: 'success', category })
}

export const getActiveCategory = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit)

    const activeCatagories = await CategoryModel.find({ status: 'Active' }).limit(limit).skip(skip).populate('Products');
    return res.status(200).json({ message: 'success', count: activeCatagories.length, activeCatagories });

}

export const getLatestNewActiveCategory = async (req, res, next) => {
    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    });
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    try {
        const mongooseQuery = CategoryModel.find({ status: 'Active', isDeleted: false, ...queryObj }).limit(limit).skip(skip);

        if (req.query.fields) {
            mongooseQuery.select(req.query.fields?.replaceAll(',', ' '));
        }

        const activeCategories = await mongooseQuery.sort({ createdAt: -1 }); // Sort by createdAt in descending order
        return res.status(200).json({ message: 'success', count: activeCategories.length, activeCategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCategory = async (req, res, next) => {
    const name = req.body.name.toLowerCase();
    if (await CategoryModel.findOne({ name }).select('name')) {
        return next(new Error("category name already exist", { cause: 409 }));
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/categories`
    })
    const user = await UserModel.findById(req.user._id);
    const createdByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const category = req.body.status ?
        await CategoryModel.create({ name: name, slug: slugify(name), image: { secure_url, public_id }, status: req.body.status, createdByUser, updatedByUser })
        :
        await CategoryModel.create({ name: name, slug: slugify(name), image: { secure_url, public_id }, createdByUser, updatedByUser })

    return res.status(201).json({ message: 'success', category });

}

export const updateCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
        return next(new Error(` invalid id ${id} `, { cause: 400 }));
    }
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    if (req.body.name) {
        const name = req.body.name.toLowerCase();
        if (await CategoryModel.findOne({ name }).select('name')) {
            return next(new Error(`category name '${name}' already exist`, { cause: 409 }));
        }
        category.name = name;
        category.slug = slugify(name);
         await ProductModel.updateMany({ categoryId }, { categoryName: category.name, updatedByUser });

    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/categories`
        })
        await cloudinary.uploader.destroy(category.image.public_id);
        category.image = { secure_url, public_id };
    }
    if (req.body.status) {
        category.status = req.body.status;
        await ProductModel.updateMany({ categoryId }, { status: req.body.status, updatedByUser });

    }
    category.updatedByUser = updatedByUser;
    await category.save()
    return res.status(201).json({ message: 'success', category });

}

export const restoreCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const category = await CategoryModel.findByIdAndUpdate(categoryId, { isDeleted: false, status: 'Active', updatedByUser: updatedByUser }, { new: true });
    if (!category) {
        return next(new Error(` invalid id ${categoryId} `, { cause: 400 }));
    }

    const restoreProducts = await ProductModel.updateMany({ categoryId }, { isDeleted: false, status: 'Active', updatedByUser: updatedByUser });

    return res.status(200).json({ message: 'success', category, restoreProducts });
}

export const softDeleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const user = await UserModel.findById(req.user._id);
    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const category = await CategoryModel.findByIdAndUpdate(categoryId, { isDeleted: true, status: 'Inactive', updatedByUser: updatedByUser }, { new: true });
    if (!category) {
        return next(new Error(` invalid id ${categoryId} `, { cause: 400 }));
    }
    const softDeleteProducts = await ProductModel.updateMany({ categoryId }, { isDeleted: true, status: 'Inactive', updatedByUser: updatedByUser }, { new: true });

    return res.status(200).json({ message: 'success', category, softDeleteProducts });
}

export const hardDeleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const category = await CategoryModel.findOneAndDelete({ _id: categoryId, isDeleted: true });
    if (!category) {
        return next(new Error(` invalid id ${categoryId} `, { cause: 400 }));
    }
    await cloudinary.uploader.destroy(category.image.public_id);

    const Products = await ProductModel.find({ categoryId });
    for (let index = 0; index < Products.length; index++) {
        await cloudinary.uploader.destroy(Products[index].mainImage.public_id); 
        await ReviewModel.deleteMany({ productId:Products[index]._id })
    }
     
    const hardDeleteProducts = await ProductModel.deleteMany({ categoryId });
    return res.status(200).json({ message: 'success', category, hardDeleteProducts });
}