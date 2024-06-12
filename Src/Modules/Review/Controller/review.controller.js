import OrderModel from "../../../../DB/model/order.model.js";
import ProductModel from "../../../../DB/model/product.model.js";
import ReviewModel from "../../../../DB/model/review.model.js";
import UserModel from "../../../../DB/model/user.model.js";
import { sendEmail } from "../../../Services/email.js";

export const createReview = async (req, res, next) => {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const order = await OrderModel.findOne({
        userId: req.user._id,
        status: 'delivered',
        "products.productId": productId
    });
    if (!order) {
        return next(new Error(" can not review this product", { cause: 400 }));
    }
    const checkReview = await ReviewModel.findOne({
        createdBy: req.user._id,
        productId: productId.toString()
    });

    if (checkReview) {
        return next(new Error("already review", { cause: 400 }));
    }
    const product = await ProductModel.findById(productId);

    const user = await UserModel.findById(req.user._id);

    const createdByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    
    const review = await ReviewModel.create({
        comment,
        rating,
        createdByUser,
        orderId: order._id,
        productId: productId.toString(),
        createdBy:user._id
    });
    if (!review) {
        return next(new Error("error while adding review", { cause: 400 }));
    }
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
                                                                                        <p>We've recently added a Review in ${product.name} in our store!</p>
                                                                                        <table style="width:100%; border-collapse: collapse;">
                                                                                            <tr>
                                                                                                    <img src="${product.mainImage.secure_url}" alt="${product.slug}" style="max-width: 300px;">
                                                                                                </tr>
                                                                                                <tr style="padding: 10px;">
                                                                                                    <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-weight: 500; font-size: 20px;color: #46D7D4; text-transform: capitalize;">${review.comment}</h3>
                                                                                                    <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; font-size: 14px; color:black;">Rating: ${review.rating} Stars</p>
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
        await sendEmail(user.email, `Product Reviewed Successfully✨🔥`, emailContent);
    } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
    }
    return res.status(201).json({ message: 'success', review });

}