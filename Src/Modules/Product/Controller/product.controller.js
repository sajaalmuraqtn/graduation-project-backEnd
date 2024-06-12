import slugify from "slugify";
import CategoryModel from "../../../../DB/model/category.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import ProductModel from "../../../../DB/model/product.model.js";
 import { pagination } from "../../../Services/pagination.js";
import UserModel from "../../../../DB/model/user.model.js";
 import { sendEmail } from "../../../Services/email.js";
import ReviewModel from "../../../../DB/model/review.model.js";

export const getAllProduct = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = ProductModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { 'createdByUser.userName': { $regex: req.query.search, $options: 'i' } },
                { 'updatedByUser.userName': { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const products = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).populate('reviews');;
    const count = await ProductModel.estimatedDocumentCount();
    return res.status(201).json({ message: 'success', page: products.length, total: count, products });

}
export const getActiveProduct = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = ProductModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }
    const currentDate = new Date();
    const products = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).find({ status: 'Active', isDeleted: false, expiredDate: { $gt: currentDate } }).populate('reviews');;
    const count = await ProductModel.estimatedDocumentCount();
    return res.status(201).json({ message: 'success', page: products.length, total: count, products });

}

export const createProduct = async (req, res, next) => {

    const { price, discount, categoryId } = req.body;

    const checkCategory = await CategoryModel.findById(categoryId);
    if (!checkCategory) {
        return next(new Error("category not found", { cause: 404 }));
    }
    if (checkCategory.status == "Inactive" || checkCategory.isDeleted) {
        return next(new Error("category is not available", { cause: 400 }));
    }
    req.body.categoryName = checkCategory.name;

     
    const name = req.body.name.toLowerCase();
    if (await ProductModel.findOne({ name }).select('name')) {
        return next(new Error("product name already exist", { cause: 409 }));
    }
    req.body.slug = slugify(name);

    req.body.finalPrice = (price - (price * (discount || 0) / 100)).toFixed(2);

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/Products`
    })
    req.body.mainImage = { secure_url, public_id };
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

    req.body.createdByUser = createdByUser;
    req.body.updatedByUser = updatedByUser;
    const product = await ProductModel.create(req.body);
    if (!product) {
        return next(new Error("error while creating product", { cause: 400 }));
    }
    if (product.status === "Active") {
        try {
            const users = await UserModel.find({ confirmEmail: true, role: 'User' });

            for (let index = 0; index < users.length; index++) {
                const user = users[index];
                const emailContent = `<!DOCTYPE html>
                <html>
                <head>
                    <!--[if !mso]><!-- -->
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <!--<![endif]-->
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <style type="text/css">
                        #outlook a { padding: 0; }
                        .ReadMsgBody { width: 100%; }
                        .ExternalClass { width: 100%; }
                        .ExternalClass * { line-height: 100%; }
                        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; overflow: hidden; }
                        table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
                        p { display: block; margin: 13px 0; }
                    </style>
                    <!--[if !mso]><!-->
                    <style type="text/css">
                        @media only screen and (max-width:480px) {
                            @-ms-viewport { width: 320px; }
                            @viewport { width: 320px; }
                        }
                    </style>
                    <!--<![endif]-->
                    <!--[if mso]>
                    <xml>
                        <o:OfficeDocumentSettings>
                            <o:AllowPNG/>
                            <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                    </xml>
                    <![endif]-->
                    <!--[if lte mso 11]>
                    <style type="text/css">
                        .outlook-group-fix { width:100% !important; }
                    </style>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
                    <style type="text/css">
                        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                    </style>
                    <!--<![endif]-->
                    <style type="text/css">
                        @media only screen and (min-width:480px) {
                            .mj-column-per-100, *[aria-labelledby="mj-column-per-100"] { width: 100% !important; }
                        }
                    </style>
                </head>
                <body style="background-color: #fafafa; overflow: hidden;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="overflow: hidden;">
                        <tr>
                            <td>
                                <div style="margin:0px auto;max-width:640px;background:#fafafa; overflow: hidden;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#fafafa;" align="center" border="0">
                                        <tbody>
                                            <tr>
                                                <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
                                                    <div style="margin:0px auto;max-width:640px;background:#fafafa;">
                                                        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#fafafa;" align="center" border="0">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 40px;">
                                                                        <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                                                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                                                                                            <div style="cursor:auto; font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:14px;line-height:22px;text-align:center;">
                                                                                                <div style="text-align:start;">
                                                                                                    <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #46D7D4;letter-spacing: 0.27px; text-transform: capitalize;">Hi ${users[index].userName}</h2>
                                                                                                    <p>We've recently added a new Product in ${req.body.categoryName} to our store! Check out our latest product:</p>
                                                                                                    <table style="width:100%; border-collapse: collapse;">
                                                                                                        <tr>
                                                                                                                <img src="${product.mainImage.secure_url}" alt="${product.slug}" style="max-width: 300px;">
                                                                                                            </tr>
                                                                                                            <tr style="padding: 10px;">
                                                                                                                <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 500; font-size: 20px;color: #46D7D4; text-transform: capitalize;">${product.name}</h3>
                                                                                                                <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">${product.description}</p>
                                                                                                                <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">Price: ₪ ${product.finalPrice}</p>
                                                                                                            </tr>
                                                                                                    </table>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td style="word-break:break-word;font-size:0px;padding:10px 20px;" align="center">
                                                                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td style="border:none;border-radius:3px;color:white;cursor:auto;padding:12px 18px;" align="center" valign="middle" bgcolor="#46D7D4">
                                                                                                            <a href="https://skinelegance-ecommerce.onrender.com" style="text-decoration:none;line-height:100%;background:#46D7D4;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:14px;font-weight:normal;text-transform:none;margin:0px;" target="_blank">
                                                                                                                View Products
                                                                                                            </a>
                                                                                                            
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div><!--[if mso | IE]>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            <![endif]-->
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
                </table>
                </body>
                </html>`;

                try {
                    await sendEmail(user.email, `New Product ✨🔥`, emailContent);
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError);
                }
            }
        } catch (error) {
            console.error('Error fetching users or sending emails:', error);
        }
    }

    return res.status(201).json({ message: 'success', product });
}

export const updateProduct = async (req, res, next) => {

    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
        return next(new Error("product not found", { cause: 404 }));
    }
    if (req.body.categoryId) {
        const checkCategory = await CategoryModel.findById(req.body.categoryId);
        if (!checkCategory) {
            return next(new Error("category not found", { cause: 404 }));
        } 

        product.categoryId = req.body.categoryId;
        product.categoryName = checkCategory.name;
    }
    if (req.body.name) {
        const name = req.body.name.toLowerCase();
        if (await ProductModel.findOne({ name }).select('name')) {
            return next(new Error("product name already exist", { cause: 409 }));
        }
        product.name = name;
        product.slug = slugify(name);
    }
    if (req.body.description) {
        product.description = req.body.description;
    }

    if (req.body.price) {
        product.price = req.body.price;
        product.finalPrice = (req.body.price - (req.body.price * (product.discount || 0) / 100)).toFixed(2);
        product.finalPrice = (req.body.price - (req.body.price * (product.discount || 0) / 100)).toFixed(2);
    }

    if (req.body.discount) {
        product.discount = req.body.discount;
        product.finalPrice = (product.price - (product.price * (req.body.discount || 0) / 100)).toFixed(2);
    }
    if (req.body.size) {
        product.size = req.body.size;
    }
    if (req.body.expiredDate) {
        product.expiredDate = req.body.expiredDate;
    }
    if (req.body.status) {
        const checkCategory = await CategoryModel.findById(product.categoryId);
         if (req.body.status == "Active" && (checkCategory.isDeleted || checkCategory.status == "Inactive" )) {
            return next(new Error("can not active this product category not available", { cause: 400 }));
        }
        product.status = req.body.status;
    }
           
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/Products`
        })
        await cloudinary.uploader.destroy(product.mainImage.public_id);
        product.mainImage = { secure_url, public_id };
    }
    
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    product.updatedByUser = updatedByUser;
    await product.save()

    return res.status(201).json({ message: 'success', product });
}

export const getProductWithCategory = async (req, res, next) => {

    const checkCategory = await CategoryModel.findById(req.params.categoryId);
    if (!checkCategory) {
        return next(new Error("category not found", { cause: 404 }));
    }

    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = ProductModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const products = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).find({ categoryId: req.params.categoryId, status: 'Active' }).populate('reviews');;
    const count = await ProductModel.estimatedDocumentCount();
    return res.status(201).json({ message: 'success', page: products.length, total: count, products });
}

export const getSpecificProduct = async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId).populate('reviews');
    if (!product) {
        return next(new Error("product not found", { cause: 404 }));
    }
    return res.status(201).json({ message: 'success', product });
}

export const restoreProduct = async (req, res, next) => {
    const checkProduct = await ProductModel.findById(req.params.productId);
    if (!checkProduct) {
        return next(new Error("product not found", { cause: 404 }));
    }
    const checkCategory = await CategoryModel.findById(checkProduct.categoryId);
    if (checkCategory.isDeleted || checkCategory.status == "Inactive") {
        return next(new Error("can not restore this product category not available", { cause: 400 }));
    }
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const product = await ProductModel.findByIdAndUpdate(req.params.productId, { isDeleted: false, status: 'Active', updatedByUser: updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', product });
}
export const softDeleteProduct = async (req, res, next) => {
    const checkProduct = await ProductModel.findById(req.params.productId);
    if (!checkProduct) {
        return next(new Error("product not found", { cause: 404 }));
    }

    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const product = await ProductModel.findByIdAndUpdate(req.params.productId, { isDeleted: true, status: 'Inactive', updatedByUser: updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', product });
}

export const hardDeleteProduct = async (req, res, next) => {
    const checkProduct = await ProductModel.findById(req.params.productId);
    if (!checkProduct) {
        return next(new Error("product not found", { cause: 404 }));
    }
    const product = await ProductModel.findOneAndDelete({ _id: req.params.productId, isDeleted: true }, { new: true });
    if (!product) {
        return next(new Error("product not Archived", { cause: 404 }));
    }
    await ReviewModel.deleteMany({ productId: req.params.productId })
    await cloudinary.uploader.destroy(product.mainImage.public_id);

    return res.status(201).json({ message: 'success', product });
}

