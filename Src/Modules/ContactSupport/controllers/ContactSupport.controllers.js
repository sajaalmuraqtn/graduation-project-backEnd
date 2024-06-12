import UserModel from "../../../../DB/model/user.model.js";
import { sendEmail } from "../../../Services/email.js";
import ContactSupportModel from '../../../../DB/model/contactSupport.js';
import { pagination } from "../../../Services/pagination.js";

export const addContact = async (req, res, next) => {

    const user = await UserModel.findById(req.user._id);
    const createdByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id,
        slug: user.slug
    }
    req.body.email = user.email;
    req.body.createdByUser = createdByUser;
    const contact = await ContactSupportModel.create(req.body);
    if (!contact) {
        return next(new Error(`error while create Contact `, { cause: 400 }));
    }
    await sendEmail(contact.email, "The Support Team has been contacted Successfully ✨", `<!DOCTYPE html>
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
                                                                                            <p style="color: #46D7D4;">Your message to Support Team :</p>
                                                                                            <p>${contact.message}</p>
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
    return res.status(201).json({ message: 'success', contact })
}

export const getAllContacts = async (req, res, next) => {

    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip','search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = ContactSupportModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { 'createdByUser.userName': { $regex: req.query.search, $options: 'i' } },
                { 'repliedBy.userName': { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }
    const contacts = await mongooseQuery;
    const readdContacts=await ContactSupportModel.find({replied:true}).count();
    const unReaddContacts=await ContactSupportModel.find({replied:false}).count();
    const RequestContacts=await ContactSupportModel.find({title:'Request an Advertisement'}).count();
    const SupportContacts=await ContactSupportModel.find({title:'Support Team'}).count();

    return res.status(201).json({ message: 'success', contacts,readdContacts,unReaddContacts,SupportContacts,RequestContacts });
}

export const getSpecificContactSupport = async (req, res, next) => {
    const contact = await ContactSupportModel.findById(req.params.contactSupportId);
    if (!contact) {
        return next(new Error("contact not found", { cause: 404 }));
    }
    return res.status(201).json({ message: 'success', contact });
}

export const addReplay = async (req, res, next) => {
    const contact = await ContactSupportModel.findById(req.params.contactSupportId);
    if (!contact) {
        return next(new Error("contact not found", { cause: 404 }));
    }
    contact.replay=req.body.replay;
    contact.replied=true;
    const user = await UserModel.findById(req.user._id);
    contact.repliedBy={
        userName: user.userName,
        image: user.image,
        _id: user._id,
        slug: user.slug
    } 
    await contact.save()
    await sendEmail(contact.email, `${contact.title}`, `<!DOCTYPE html>
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
                                                                                            <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${contact.createdByUser.userName}</h2>
                                                                                            <p style="color: #46D7D4;">Replay:</p>
                                                                                            <p>${contact.replay}</p>
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
    return res.status(201).json({ message: 'success', contact });
}


