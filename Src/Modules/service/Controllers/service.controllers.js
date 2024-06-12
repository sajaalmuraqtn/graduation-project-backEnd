import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import { pagination } from "../../../Services/pagination.js";
import UserModel from "../../../../DB/model/user.model.js";
import ServiceModel from "../../../../DB/model/service.model.js";
import AdvertisementModel from "../../../../DB/model/advertisement.model.js";
import { sendEmail } from "../../../Services/email.js";

export const getAllServices = async (req, res, next) => {
    const services = await ServiceModel.find({ advertisementId: req.params.advertisementId });
    return res.status(201).json({ message: 'success', services });
}

export const getActiveService = async (req, res, next) => {
    const services = await ServiceModel.find({ status: 'Active', advertisementId: req.params.advertisementId });
    return res.status(201).json({ message: 'success', services });

}

export const createService = async (req, res, next) => {
    const { price, discount } = req.body;
    const advertisementId = req.params.advertisementId;
    const checkAdvertisement = await AdvertisementModel.findById(req.params.advertisementId);

    if (!checkAdvertisement) {
        return next(new Error("Advertisement not found", { cause: 404 }));
    }

    if (checkAdvertisement.status == "Inactive" || checkAdvertisement.isDeleted) {
        return next(new Error("Advertisement is not available", { cause: 400 }));
    }

    req.body.advertisementId = checkAdvertisement._id;
    req.body.advertisementName = checkAdvertisement.name;

    const name = req.body.name.toLowerCase();
    if (await ServiceModel.findOne({ name, advertisementId: advertisementId }).select('name')) {
        return next(new Error("Service name already exist in this Advertisement", { cause: 409 }));
    }
    req.body.slug = slugify(name);

    req.body.finalPrice = (price - (price * (discount || 0) / 100)).toFixed(2);

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/Services`
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
    const service = await ServiceModel.create(req.body);
    if (!service) {
        return next(new Error("error while creating service", { cause: 400 }));
    }
    if (service.status === "Active") {
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
                                        <div style="margin:0px auto;max-width:640px;background:#fafafa; overflow: hidden;">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#fafafa;" align="center" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 40px;">
                                                            <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%; overflow: hidden;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                                                                                <div style="cursor:auto; font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:14px;line-height:22px;text-align:center;">
                                                                                    <div style="text-align:start;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #46D7D4;letter-spacing: 0.27px; text-transform: capitalize;">Hi ${user.userName}</h2>
                                                                                        <p>We've recently added a new Service in ${req.body.advertisementName} to our store! Check out our latest Service:</p>
                                                                                        <table style="width:100%; border-collapse: collapse;">
                                                                                            <tr>
                                                                                                    <img src=${service.mainImage.secure_url} alt=${service.slug} style="max-width: 300px;">
                                                                                                </tr>
                                                                                                <tr style="padding: 10px;">
                                                                                                    <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 500; font-size: 16px;color: #46D7D4; text-transform: capitalize;">${service.name}</h3>
                                                                                                    <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">${service.description}</p>
                                                                                                    <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">Price: ₪ ${service.finalPrice}</p>
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
                    await sendEmail(user.email, `${req.body.advertisementName} New Service ✨🔥`, emailContent);
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError);
                }
            }
        } catch (error) {
            console.error('Error fetching users or sending emails:', error);
        }
    }

    return res.status(201).json({ message: 'success', service });
}

export const updateService = async (req, res, next) => {
    const advertisementId = req.params.advertisementId;

    const service = await ServiceModel.findById(req.params.serviceId);
    if (!service) {
        return next(new Error("service not found", { cause: 404 }));
    }

    if (req.body.name) {
        const name = req.body.name.toLowerCase();
        if (await ServiceModel.findOne({ name, advertisementId: advertisementId }).select('name')) {
            return next(new Error("Service name already exist in this Advertisement", { cause: 409 }));
        }
        req.body.slug = slugify(name);
    }

    if (req.body.description) {
        service.description = req.body.description;
    }

    if (req.body.price) {
        service.price = req.body.price;
        service.finalPrice = (req.body.price - (req.body.price * (service.discount || 0) / 100)).toFixed(2);
    }

    if (req.body.discount) {
        service.discount = req.body.discount;
        service.finalPrice = (service.price - (service.price * (req.body.discount || 0) / 100)).toFixed(2);
    }

    if (req.body.status) {
        const checkAdvertisement = await AdvertisementModel.findById(service.advertisementId);
        if (req.body.status == "Active" && (checkAdvertisement.isDeleted || checkAdvertisement.status == "Inactive")) {
            return next(new Error("can not active this service advertisement not available", { cause: 400 }));
        }
        service.status = req.body.status;
    }


    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/Services`
        })
        await cloudinary.uploader.destroy(service.mainImage.public_id);
        service.mainImage = { secure_url, public_id };
    }


    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    service.updatedByUser = updatedByUser;
    await service.save()

    return res.status(201).json({ message: 'success', service });
}

export const getSpecificService = async (req, res, next) => {
    const service = await ServiceModel.findById(req.params.serviceId);
    if (!service) {
        return next(new Error("service not found", { cause: 404 }));
    }
    return res.status(201).json({ message: 'success', service });
}

export const restoreService = async (req, res, next) => {
    const checkService = await ServiceModel.findById(req.params.serviceId);
    if (!checkService) {
        return next(new Error("service not found", { cause: 404 }));
    }
    const checkAdvertisement = await AdvertisementModel.findById(checkService.advertisementId);
    if (checkAdvertisement.isDeleted || checkAdvertisement.status == "Inactive") {
        return next(new Error("can not restore this service Advertisement not available", { cause: 400 }));
    }
    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const service = await ServiceModel.findByIdAndUpdate(req.params.serviceId, { isDeleted: false, status: 'Active', updatedByUser: updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', service });
}

export const softDeleteService = async (req, res, next) => {
    const checkService = await ServiceModel.findById(req.params.serviceId);
    if (!checkService) {
        return next(new Error("service not found", { cause: 404 }));
    }

    const user = await UserModel.findById(req.user._id);

    const updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const service = await ServiceModel.findByIdAndUpdate(req.params.serviceId, { isDeleted: true, status: 'Inactive', updatedByUser: updatedByUser }, { new: true });
    return res.status(201).json({ message: 'success', service });
}

export const hardDeleteService = async (req, res, next) => {
    const checkService = await ServiceModel.findById(req.params.serviceId);
    if (!checkService) {
        return next(new Error("service not found", { cause: 404 }));
    }

    const service = await ServiceModel.findOneAndDelete({ _id: req.params.serviceId, isDeleted: true }, { new: true });
    if (!service) {
        return next(new Error("service not deleted", { cause: 404 }));
    }
    await cloudinary.uploader.destroy(service.mainImage.public_id); 

    return res.status(201).json({ message: 'success', service });
}

