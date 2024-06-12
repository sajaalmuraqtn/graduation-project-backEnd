import jwt from 'jsonwebtoken'
 import UserModel from "../../../../DB/model/user.model.js";
 import OrderContactModel from "../../../../DB/model/orderContact.model.js";
import { sendEmail } from "../../../Services/email.js";

export const addContact = async (req, res,next) => {
     const {email, phoneNumber } = req.body;
    if (await OrderContactModel.findOne({ email: email})) {
        return next(new Error("email Already exist",{cause:409}));
     }
  
    if (await OrderContactModel.findOne({ phoneNumber:phoneNumber })) {
        return next(new Error("Phone Number Already exist",{cause:409}));
     }
     const token = jwt.sign({ email }, process.env.CONFIRMEMAILSECRET);
    await sendEmail(email, "confirm Contact Email", `<!DOCTYPE html>
    <html>
    <head>
        <title></title>
        <!--[if !mso]><!-- -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style type="text/css">
            #outlook a { padding: 0; }
            .ReadMsgBody { width: 100%; }
            .ExternalClass { width: 100%; }
            .ExternalClass * { line-height: 100%; }
            body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; }
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
    <body style="background-color: #fafafa;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
            <tr>
                <td>
                    <div style="margin:0px auto;max-width:640px;background:#fafafa;">
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
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi Admin</h2>
                                                                                        <p>Welcome to Skin Elegance Shop! We're delighted to have you join our community of skin care enthusiasts. To ensure that users contacts with our team, please verify this admin contact email address by clicking the link below.</p>
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
                                                                                                <a href="${req.protocol}://${req.headers.host}/contact/confirmEmail/${token}" style="text-decoration:none;line-height:100%;background:#46D7D4;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:14px;font-weight:normal;text-transform:none;margin:0px;" target="_blank">
                                                                                                    Confirm Contact Email
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
    </html>
    `);
    const user =await UserModel.findById(req.user._id);
    const createdByUser={
        userName:user.userName,
        image:user.image,
        _id:user._id
    } 
    req.body.createdByUser=createdByUser;
    const createContact = await OrderContactModel.create(req.body);
    if (!createContact) {
        return next(new Error(`error while create Contact `, { cause: 400 }));
    }
    return res.status(201).json({ message: 'success', createContact })
}
  
export const confirmEmail = async (req, res,next) => {
    const token = req.params.token;
    const decoded = await jwt.verify(token, process.env.CONFIRMEMAILSECRET);
    if (!decoded) {
        return next(new Error("invalid token",{cause:404}));
    }
    const user = await OrderContactModel.findOneAndUpdate({ email: decoded.email, confirmEmail:false },{ confirmEmail: true });
    if (!user) {
        return next(new Error("Invalid Verify Email Or Your Email is Verified",{cause:400 }));
    
    }
    return res.redirect(process.env.LOGINFRONTEND)
    // return res.status(200).json({ message: 'Your Email Verified Successfully' });
}

export const getAllContacts = async (req, res, next) => {
   
    const contacts = await  OrderContactModel.find();
    return res.status(201).json({ message: 'success', contacts });
}
 
export const getConfirmedContacts = async (req, res, next) => { 
 
    const contacts = await OrderContactModel.find({ confirmEmail: 'true'  });
    if (!contacts) {
        return next(new Error(`error while fetching data`, { cause: 400 }));
    }
    return res.status(200).json({ message: 'success', contacts }); 
}
 
 
export const deleteUnConfirmedContacts=async(req,res,next)=>{
    const invalidConfirmsContacts=await OrderContactModel.deleteMany({confirmEmail:false});
    return res.status(201).json({ message: 'success', invalidConfirmsContacts })
    
}

export const deleteContact=async(req,res,next)=>{
    if (!await OrderContactModel.findById(req.params.contactId)) {
        return next(new Error("Contact not found",{cause:404})); 
    }
    const contact=await OrderContactModel.findByIdAndDelete(req.params.contactId);
    return res.status(201).json({ message: 'success', contact })
    
}