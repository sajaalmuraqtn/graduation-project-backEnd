import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import AdvertisementModel from "../../../../DB/model/advertisement.model.js";
import { pagination } from "../../../Services/pagination.js";
import ServiceModel from "../../../../DB/model/service.model.js";
import UserModel from "../../../../DB/model/user.model.js";
import { sendEmail } from "../../../Services/email.js";

export const getAllAdvertisement = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = AdvertisementModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { 'createdByUser.userName': { $regex: req.query.search, $options: 'i' } },
                { 'updatedByUser.userName': { $regex: req.query.search, $options: 'i' } }
            ]
        })
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const advertisements = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).populate('Services');
    const count = await AdvertisementModel.estimatedDocumentCount();
    return res.status(201).json({ message: 'success', page: advertisements.length, total: count, advertisements });

}

export const getActiveAdvertisement = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit);
    const currentDate = new Date();

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = AdvertisementModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { city: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const advertisements = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).find({ status: 'Active', isDeleted: false, expiredDate: { $gt: currentDate } }).populate('Services');
    const count = await AdvertisementModel.estimatedDocumentCount();
    return res.status(201).json({ message: 'success', page: advertisements.length, total: count, advertisements });
}

export const createAdvertisement = async (req, res, next) => {

    const name = req.body.name.toLowerCase();
    if (await AdvertisementModel.findOne({ name })) {
        return next(new Error("advertisement name already exist", { cause: 409 }));
    }
    req.body.name = name;
    req.body.slug = slugify(name);


    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/advertisements`
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
    const advertisement = await AdvertisementModel.create(req.body);
    if (!advertisement) {
        return next(new Error("error while creating advertisement", { cause: 400 }));
    }
    if (advertisement.status === "Active") {
        try {
            const users = await UserModel.find({ confirmEmail: true, role: 'User' });
    
            for (let index = 0; index < users.length; index++) {
                const user = users[index];
                const emailContent = `
                <!DOCTYPE html>
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
                                                                                                    <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #46D7D4;letter-spacing: 0.27px;">Hi ${users[index].userName}</h2>
                                                                                                    <p>We've recently added a new Advertisement in ${req.body.name} to our store! Check out our latest Advertisement:</p>
                                                                                                    <table style="width:100%; border-collapse: collapse;">
                                                                                                           <tr>
                                                                                                                <img src=${advertisement.mainImage.secure_url} alt=${advertisement.slug} style="max-width: 300px;">
                                                                                                            </tr>
                                                                                                            <tr style="padding: 10px;">
                                                                                                                <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500; font-size: 16px;color: #46D7D4; text-transform: capitalize;">${advertisement.name}</h3>
                                                                                                                <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">${advertisement.description}</p>
                                                                                                                <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">City: ${advertisement.city}</p>
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
                                                                                                                View Advertisements
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
                    await sendEmail(user.email, `New Advertisement ✨🔥`, emailContent);
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError);
                }
            }
        } catch (error) {
            console.error('Error fetching users or sending emails:', error);
        }
    }
    
    return res.status(201).json({ message: 'success', advertisement });
}

export const updateAdvertisement = async (req, res, next) => {

    const advertisement = await AdvertisementModel.findById(req.params.advertisementId);
    if (!advertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }

    if (req.body.name) {
        const name = req.body.name.toLowerCase();
        if (await AdvertisementModel.findOne({ name }).select('name')) {
            return next(new Error("advertisement name already exist", { cause: 409 }));
        }
        advertisement.name = name;
        advertisement.slug = slugify(name);
    }
    if (req.body.description) {
        advertisement.description = req.body.description;
    }

    if (req.body.instagramLink) {
        advertisement.instagramLink = req.body.instagramLink;
    }

    if (req.body.facebookLink) {
        advertisement.facebookLink = req.body.facebookLink;
    }

    if (req.body.expiredDate) {
        advertisement.expiredDate = req.body.expiredDate;
    }

    if (req.body.status) {
        advertisement.status = req.body.status;
        await ServiceModel.updateMany({ advertisementId: req.params.advertisementId }, { status: req.body.status, updatedByUser: updatedByUser });
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/advertisements`
        })
        await cloudinary.uploader.destroy(advertisement.mainImage.public_id);
        advertisement.mainImage = { secure_url, public_id };
    }

    advertisement.updatedByUser = updatedByUser;
    await advertisement.save()

    return res.status(201).json({ message: 'success', advertisement });
}



export const getSpecificAdvertisementAdmin = async (req, res, next) => {
    const advertisement = await AdvertisementModel.findById(req.params.advertisementId).populate('Services');
    if (!advertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }

    return res.status(201).json({ message: 'success', advertisement });
}
export const getSpecificAdvertisement = async (req, res, next) => {
    const advertisement = await AdvertisementModel.findById(req.params.advertisementId).populate({
        path: 'Services',
        match: {
            isDeleted: false,
            status: 'Active'
        }
    });
    if (!advertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }

    return res.status(201).json({ message: 'success', advertisement });
}

export const restoreAdvertisement = async (req, res, next) => {
    const checkAdvertisement = await AdvertisementModel.findById(req.params.advertisementId);
    if (!checkAdvertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const advertisement = await AdvertisementModel.findByIdAndUpdate(req.params.advertisementId, { isDeleted: false, status: 'Active', updatedByUser }, { new: true });
    await ServiceModel.updateMany({ advertisementId: req.params.advertisementId }, { isDeleted: false, status: 'Active', updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', advertisement });
}

export const softDeleteAdvertisement = async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }

    const advertisement = await AdvertisementModel.findByIdAndUpdate(req.params.advertisementId, { isDeleted: true, status: 'Inactive', updatedByUser }, { new: true });
    if (!advertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }

    await ServiceModel.updateMany({ advertisementId: req.params.advertisementId }, { isDeleted: true, status: 'Inactive', updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', advertisement });
}

export const hardDeleteAdvertisement = async (req, res, next) => {
    const advertisement = await AdvertisementModel.findByIdAndDelete(req.params.advertisementId);
    if (!advertisement) {
        return next(new Error("advertisement not found", { cause: 404 }));
    }
    await cloudinary.uploader.destroy(advertisement.mainImage.public_id); 

    const services = await ServiceModel.find({advertisementId:req.params.advertisementId});
    for (let index = 0; index < services.length; index++) {
        await cloudinary.uploader.destroy(services[index].mainImage.public_id); 
    }
    
    await ServiceModel.deleteMany({ advertisementId: req.params.advertisementId });
    return res.status(201).json({ message: 'success', advertisement });
}







