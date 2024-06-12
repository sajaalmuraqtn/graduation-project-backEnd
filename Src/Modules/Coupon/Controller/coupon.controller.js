import slugify from "slugify";
import CouponModel from "../../../../DB/model/coupon.model.js";
import UserModel from "../../../../DB/model/user.model.js";
import cloudinary from "../../../Services/cloudinary.js";
import { pagination } from "../../../Services/pagination.js";
import { sendEmail } from "../../../Services/email.js";

export const CreateCoupon = async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();
  if (await CouponModel.findOne({ name: req.body.name })) {
    return next(new Error("coupon name already exist", { cause: 409 }));
  }
  req.body.slug=slugify(req.body.name.toLowerCase());
  req.body.expiredDate = new Date(req.body.expiredDate);
 
  const user =await UserModel.findById(req.user._id);
  const createdByUser={
      userName:user.userName,
      image:user.image,
      _id:user._id
  }
  const updatedByUser={
      userName:user.userName,
      image:user.image,
      _id:user._id
  }   

 req.body.createdByUser=createdByUser;
  req.body.updatedByUser=updatedByUser;
  const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/coupons`
  })
  
  req.body.image = { secure_url, public_id };
  const coupon = await CouponModel.create(req.body);
 
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
                                                                                            <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #46D7D4;letter-spacing: 0.27px; text-transform: capitalize;">Hi ${user.userName},</h2>
                                                                                            <p>We're excited to announce a brand new coupon available for all products on our website! Enjoy amazing discounts on your favorite items.</p>
                                                                                            <p>Don't miss out on this limited-time offer. Use the coupon code <strong style="color: #46D7D4; text-transform: capitalize;">${coupon.name}</strong> at checkout and save %${coupon.amount} on your purchase.</p>
                                                                                            <table style="width:100%; border-collapse: collapse;">
                                                                                                <tr>
                                                                                                    <td style="padding: 10px;">
                                                                                                        <img src="${coupon.image.secure_url}" alt="${coupon.slug}" style="max-width: 300px;">
                                                                                                    </td>
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
                                                                                                        Shop Now
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
            await sendEmail(user.email, `New Coupon ✨🔥`, emailContent);
        } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError);
        }
    }
} catch (error) {
    console.error('Error fetching users or sending emails:', error);
}




  return res.status(201).json({ message: 'success', coupon });
}

export const GetSpecificCoupons = async (req, res, next) => {
  const coupon = await CouponModel.findById(req.params.couponId);
  if (!coupon) {
    return next(new Error("coupon not found", { cause: 404 }));

  }
  return res.status(200).json({ message: 'success', coupon });
}

export const GetAllCoupons = async (req, res, next) => {
  const { limit, skip } = pagination(req.query.page, req.query.limit);

  let queryObj = { ...req.query };
  const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
  execQuery.map((ele) => {
      delete queryObj[ele];
  })
  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
  queryObj = JSON.parse(queryObj);

  const mongooseQuery = CouponModel.find(queryObj).limit(limit).skip(skip);
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

  const coupons = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' '));
    return res.status(200).json({ message: 'success', coupons });
}

export const getActiveCoupons = async (req, res, next) => {
  const { limit, skip } = pagination(req.query.page, req.query.limit);

  let queryObj = { ...req.query };
  const execQuery = ['page', 'limit', 'skip', 'sort'];
  execQuery.map((ele) => {
      delete queryObj[ele];
  })
  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
  queryObj = JSON.parse(queryObj);

  const mongooseQuery = CouponModel.find(queryObj).limit(limit).skip(skip);

  if (req.query.fields) {
      mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
  }

  const coupons = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' ')).find({ isDeleted: false });
  return res.status(200).json({ message: 'success', coupons });
}

export const UpdateCoupon = async (req, res, next) => {
  const couponId = req.params.couponId;
  const coupon = await CouponModel.findById(couponId);

  if (!coupon) {
    return next(new Error("coupon not found", { cause: 404 }));
  }
  if (req.body.name) {
    const name = req.body.name.toLowerCase();

    if (await CouponModel.findOne({ name }).select('name')) {
      return next(new Error(`coupon name '${req.body.name}' already exist`, { cause: 409 }));
    }
    coupon.name = name;
    coupon.slug=slugify(name);
  }

  if (req.body.amount) {
    coupon.amount = req.body.amount;
  }
  if (req.body.expiredDate) {
    coupon.expiredDate = req.body.expiredDate;
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/coupons`
    })
    await cloudinary.uploader.destroy(coupon.image.public_id);
    coupon.image = { secure_url, public_id };
  }

  const user =await UserModel.findById(req.user._id);

  const updatedByUser={
      userName:user.userName,
      image:user.image,
      _id:user._id
  } 
  coupon.updatedByUser = updatedByUser;

  await coupon.save()
  return res.status(200).json({ message: 'success', coupon });
}

export const SoftDelete = async (req, res, next) => {
  const couponId = req.params.couponId;
  if (! await CouponModel.findById(couponId)) {
    return res.status(404).json({ message: 'coupon not found' });
  }
  const user =await UserModel.findById(req.user._id);

  const updatedByUser={
      userName:user.userName,
      image:user.image,
      _id:user._id
  } 
  const coupon = await CouponModel.findOneAndUpdate({ _id: couponId, isDeleted: false }, { isDeleted: true,updatedByUser}, { new: true });
  if (!coupon) {
    return res.status(400).json({ message: 'can not delete this coupon ' });
  }
  return res.status(200).json({ message: 'success', coupon });
}

export const HardDelete = async (req, res, next) => {
  const couponId = req.params.couponId;
  if (! await CouponModel.findById(couponId)) {
    return res.status(404).json({ message: 'coupon not found' });
  }
  const coupon = await CouponModel.findOneAndDelete({ _id: couponId, isDeleted: true }, { new: true });
  if (!coupon) {
    return res.status(400).json({ message: 'can not delete this coupon ' });
  }
  return res.status(200).json({ message: 'success', coupon });
}


export const Restore = async (req, res, next) => {
  const couponId = req.params.couponId;
  if (! await CouponModel.findById(couponId)) {
    return res.status(404).json({ message: 'coupon not found' });
  }
  const user =await UserModel.findById(req.user._id);

  const updatedByUser={
      userName:user.userName,
      image:user.image,
      _id:user._id
  } 
  const coupon = await CouponModel.findOneAndUpdate({ _id: couponId, isDeleted: true }, { isDeleted: false,updatedByUser }, { new: true });
  if (!coupon) {
    return res.status(400).json({ message: 'can not restore this coupon ' });
  }
  return res.status(200).json({ message: 'success', coupon });

}