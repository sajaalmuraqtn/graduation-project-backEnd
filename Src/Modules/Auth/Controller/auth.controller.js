import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import UserModel from '../../../../DB/model/user.model.js'
import cloudinary from '../../../Services/cloudinary.js';
import { sendEmail } from '../../../Services/email.js';
 import { customAlphabet, nanoid } from 'nanoid';
import slugify from 'slugify';
import CenterProviderModel from '../../../../DB/model/centerProvider.model.js';

export const signUp = async (req, res,next) => {
  
    const {email, password,phoneNumber,address} = req.body;
    if (await UserModel.findOne({ email: email })) {
        return next(new Error("email Already exist",{cause:409}));
     }
    const hashPassword = await bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
  
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.APP_NAME}/User`
    }) 
    let userName='';
    if (req.body.userName) {
        userName = req.body.userName.toLowerCase();
        if (await UserModel.findOne({ userName }).select('userName')) {
            return next(new Error("userName already exist", { cause: 409 }));
        }
    } 
      
    const slug = slugify(userName);
    const token = jwt.sign({ email }, process.env.CONFIRMEMAILSECRET);
    await sendEmail(email, "Confirm Email", `<!DOCTYPE html>
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
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${req.body.userName}</h2>
                                                                                        <p>Welcome to Skin Elegance Shop! We're thrilled to have you join our community of skin care enthusiasts. To start exploring the best in skin care products, please verify your email address by clicking the link below.</p>
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
                                                                                                <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}" style="text-decoration:none;line-height:100%;background:#46D7D4;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:14px;font-weight:normal;text-transform:none;margin:0px;" target="_blank">
                                                                                                    Verify Email
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
    
    const createUser = await UserModel.create({ userName, email, password: hashPassword, image: { secure_url, public_id },slug,phoneNumber,address });
    if (!createUser) {
        return next(new Error(`error while create user `, { cause: 400 }));
    }
    return res.status(201).json({ message: 'success', createUser })
}


export const AddAdminAccount = async (req, res,next) => {
  
        const {email, password,phoneNumber} = req.body;
        if (await UserModel.findOne({ email: email })) {
            return next(new Error("email Already exist",{cause:409}));
         }
        const hashPassword = await bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
      
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.APP_NAME}/User`
        }) 
        let userName='';
        if (req.body.userName) {
            userName = req.body.userName.toLowerCase();
            if (await UserModel.findOne({ userName }).select('userName')) {
                return next(new Error("userName already exist", { cause: 409 }));
            }
        } 
          
        const slug = slugify(userName);

        const createAdminUser = await UserModel.create({ userName, email, password: hashPassword, image: { secure_url, public_id },confirmEmail:true,slug,phoneNumber,role:'Admin'});
        if (!createAdminUser) {
            return next(new Error(`error while create admin `, { cause: 400 }));
        }
        return res.status(201).json({ message: 'success', createAdminUser })
}

export const confirmEmail = async (req, res,next) => {
    const token = req.params.token;
    const decoded = await jwt.verify(token, process.env.CONFIRMEMAILSECRET);
    if (!decoded) {
        return next(new Error("invalid token",{cause:404}));
    }
    const user = await UserModel.findOneAndUpdate({ email: decoded.email, confirmEmail:false },{ confirmEmail: true });
    if (!user) {
        return next(new Error("Invalid Verify Email Or Your Email is Verified",{cause:400 }));
    
    }
    return res.redirect(process.env.LOGINFRONTEND)
    // return res.status(200).json({ message: 'Your Email Verified Successfully' });
}


export const sendCode = async (req, res,next) => {
    const { email} = req.body;
    if (!await UserModel.findOne({ email: email })) {
        return next(new Error("not register account",{cause:404})); 
    }
    let code=customAlphabet('123456789abcdzABCDZ',4);
    code=code();
    const user = await UserModel.findOneAndUpdate({email},{sendCode:code},{new:true});    
    await sendEmail(email, "Reset Password Code", `<!DOCTYPE html>
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
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Reset Code : ${code}</h1>
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
    
    return res.status(200).json({ message: 'success'});
}

export const changePassword  = async (req, res,next) => {
    const {   lastPassword, newPassword, confirmPassword } = req.body;

    // Find the user based on user that logged in
    const user = await UserModel.findById(req.user._id);
 
    // Verify if the provided last password matches the user's current password
    const isPasswordMatch = await bcrypt.compare(lastPassword, user.password);
    if (!isPasswordMatch) {
        return next(new Error("Invalid last password", { cause: 400 }));
    }

    // Check if the new password is the same as the last password
    if (lastPassword === newPassword) {
        return next(new Error("New password cannot be the same as the last password", { cause: 409 }));
    }

    // Check if the new password matches the confirmed password
    if (newPassword !== confirmPassword) {
        return next(new Error("New password and confirm password do not match", { cause: 400 }));
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALTROUND));

    // Update user's password and other relevant fields
    user.password = hashedNewPassword;
    user.changePasswordTime = Date.now();

    // Save the updated user
    await user.save();
    await sendEmail(email, "Change Password Successfully", `<!DOCTYPE html>
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
                                                                                        <p>Your Password Changed Successfully</p>
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
    
    return res.status(200).json({ message: 'success'});
}

export const forgotPassword = async (req, res,next) => {
    const { email,password,confirmPassword,code} = req.body;
    const user = await UserModel.findOne({ email: email })
    if (!user) {
        return next(new Error("not register account",{cause:404})); 
    }
    if (user.sendCode!=code) {
        return next(new Error("invalid code",{cause:400})); 
    }
    let match=await bcrypt.compare(password,user.password);
    if (match) {
        return next(new Error("same password",{cause:409})); 
    }
    if (password !== confirmPassword) {
        return next(new Error("New password and confirm password do not match", { cause: 400 }));
    }

    user.password=await bcrypt.hashSync(password,parseInt(process.env.SALTROUND));
    user.sendCode=null;
    user.changePasswordTime=Date.now();
    user.save();
    await sendEmail(email, "Change Password Successfully", `<!DOCTYPE html>
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
                                                                                        <p>Your Password Changed Successfully</p>
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
    
    return res.status(200).json({ message: 'success'})
}


export const adminSignIn = async (req, res,next) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    const centerProvider=await CenterProviderModel.findOne({ email: email });
    let token;
    let refreshToken;
    if (centerProvider) {
        if (!centerProvider.confirmEmail) {
            return next(new Error("please confirm your email!!!",{cause:400}));  
        }
        const match = await bcrypt.compareSync(password, centerProvider.password);
        if (!match) {
            return next(new Error("data invalid",{cause:400}));  
        }
        const centerProviderDate=await CenterProviderModel.findOne({email:email,expiredDate: { $gt: currentDate } });
        if (!centerProviderDate) {
            return next(new Error("Your account as center Provider is Expired",{cause:400}));  
        }
         token = await jwt.sign({ id: centerProvider._id, role: 'Center',image:centerProvider.image,userName:centerProvider.centerProviderName  ,expiredDate: centerProvider.expiredDate  }, process.env.LOGINSECRET,
            {expiresIn:'40m'}
        );
         refreshToken = await jwt.sign({ id: centerProvider._id, role: 'Center',image:centerProvider.image,userName:centerProvider.centerProviderName  ,expiredDate: centerProvider.expiredDate  }, process.env.LOGINSECRET, { expiresIn:60*60*24*30 });
      
        await sendEmail(email, "Logged In Successfully", `<!DOCTYPE html>
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
                                                                                            <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName} Admin</h2>
                                                                                            <p>Welcome Back to Skin Elegance DashBoard! We're thrilled to have you join our community of skin care enthusiasts. To start exploring the best in skin care products</p>
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
        </html>`);
    }
    else{
      if (!user || user.role!='Admin') {
        return next(new Error("data invalid",{cause:400}));  
    }
 
    if (!user.confirmEmail) {
        return next(new Error("please confirm your email!!!",{cause:400}));  
    }
    const match = await bcrypt.compareSync(password, user.password);
    if (!match) {
        return next(new Error("data invalid",{cause:400}));  
    }
     token = await jwt.sign({ id: user._id, role: user.role, status: user.status,image:user.image,userName:user.userName }, process.env.LOGINSECRET,
        {expiresIn:'40m'}
    );
     refreshToken = await jwt.sign({ id: user._id, role: user.role, status: user.status,image:user.image,userName:user.userName  }, process.env.LOGINSECRET, { expiresIn:60*60*24*30 });
    await sendEmail(email, "Logged In Successfully", `<!DOCTYPE html>
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
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName} Admin</h2>
                                                                                        <p>Welcome Back to Skin Elegance DashBoard! We're thrilled to have you join our community of skin care enthusiasts. To start exploring the best in skin care products</p>
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
    </html>`);  
    }
    
    
    return res.status(201).json({ message: 'success', token, refreshToken })
}

export const signIn = async (req, res,next) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
 
    if (!user || user.role!='User') {
        return next(new Error("data invalid",{cause:400}));  
    }
    if (!user.confirmEmail) {
        return next(new Error("please confirm your email!!!",{cause:400}));  
    }
    const match = await bcrypt.compareSync(password, user.password);
    if (!match) {
        return next(new Error("data invalid",{cause:400}));  
    }
    const token = await jwt.sign({ id: user._id, role: user.role, status: user.status,image:user.image,userName:user.userName  }, process.env.LOGINSECRET,
         {expiresIn:'30m'}
    );
    const refreshToken = await jwt.sign({ id: user._id, role: user.role, status: user.status,image:user.image,userName:user.userName  }, process.env.LOGINSECRET, { expiresIn:60*60*24*30 });
    await sendEmail(email, "Logged In Successfully", `<!DOCTYPE html>
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
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center" style="background-color: #fafafa; overflow: hidden;">
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
                                                            <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                                                                                <div style="cursor:auto; font-family:Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:14px;line-height:22px;text-align:center;">
                                                                                    <p><img src="https://res.cloudinary.com/dnkdk0ddu/image/upload/v1716562329/SkinElegance-Shop/nrjct9sjh2m4o1dtumg8.png" alt="Party Wumpus" title="None" width="250" style="height: auto;"></p>
                                                                                    <div style="text-align:start;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName}</h2>
                                                                                        <p>Welcome Back to Skin Elegance Shop! We're thrilled to have you join our community of skin care enthusiasts. To start exploring the best in skin care products</p>
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
    
    
    return res.status(201).json({ message: 'success', token, refreshToken })
}



export const deleteInvalidConfirm=async(req,res,next)=>{
    const invalidConfirmsUsers=await UserModel.deleteMany({confirmEmail:false});
    return res.status(201).json({ message: 'success', invalidConfirmsUsers })
    
}