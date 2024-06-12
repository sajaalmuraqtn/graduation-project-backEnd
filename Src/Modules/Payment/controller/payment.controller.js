import PaymentMethodModel from "../../../../DB/model/paymentmethod.model.js";
import UserModel from "../../../../DB/model/user.model.js";
import { sendEmail } from "../../../Services/email.js";


export const createPaymentMethod = async (req, res, next) => {
    const Payment = await PaymentMethodModel.findOne({
        'createdByUser._id': req.user._id,
        'cardDetails.cardNumber': req.body.cardNumber
    });
    
    if (Payment) {
        return next(new Error("Payment card already exists", { cause: 400 }));
    }

    const user = await UserModel.findById(req.user._id);

    const createdByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }

    const cardDetails = {
        cardNumber: req.body.cardNumber,
        cardType: req.body.cardType,
        expiryDate: req.body.expiryDate,
        cvc: req.body.cvc,
        cardholderName: req.body.cardholderName
    }

    
    const paymentMethod = await PaymentMethodModel.create({ createdByUser,cardDetails});

    return res.status(201).json({ message: 'success', paymentMethod }) ;
}

export const getPaymentMethod = async (req, res, next) => {
    const PaymentMethods = await PaymentMethodModel.find({
        'createdByUser._id': req.user._id 
    });
     
    return res.status(201).json({ message: 'success', PaymentMethods }) ;
}

export const getSpecificPaymentMethod = async (req, res, next) => {
    const paymentMethod = await PaymentMethodModel.findById(req.params.paymentMethodId);
    
    if (!paymentMethod) {
        return next(new Error("Payment card Not Found", { cause: 404 }));
    } 
     
    return res.status(201).json({ message: 'success', paymentMethod }) ;
}

export const deletePaymentMethod = async (req, res, next) => {
    const paymentMethod = await PaymentMethodModel.findByIdAndDelete(req.params.paymentMethodId);
    
    if (!paymentMethod) {
        return next(new Error("Payment card Not Found", { cause: 404 }));
    } 
    const user = await UserModel.findById(req.user._id);
console.log(paymentMethod);
    await sendEmail(user.email, "Card Deleted Successfully", `<!DOCTYPE html>
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
                                                                                    <p><img src="https://res.cloudinary.com/dnkdk0ddu/image/upload/v1716562329/SkinElegance-Shop/nrjct9sjh2m4o1dtumg8.png" alt="Party Wumpus" title="None" width="250" style="height: auto;"></p>
                                                                                    <div style="text-align:start;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName}</h2>
                                                                                        <p style="color: #46D7D4;">Your Card Number :</p>
                                                                                        <p>${paymentMethod.cardDetails.cardNumber}/${paymentMethod.cardDetails.cardholderName}</p>
                                                                                    </div>
                                                                                </div>
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
    </html>    
    `);
    return res.status(201).json({ message: 'success', paymentMethod }) ;
}