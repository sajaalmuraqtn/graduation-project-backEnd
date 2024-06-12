import CartModel from "../../../../DB/model/cart.model.js";
import CouponModel from "../../../../DB/model/coupon.model.js";
import OrderModel from "../../../../DB/model/order.model.js";
import ProductModel from "../../../../DB/model/product.model.js";
import UserModel from "../../../../DB/model/user.model.js";
import moment from 'moment';
import { pagination } from "../../../Services/pagination.js";
import OrderContactModel from "../../../../DB/model/orderContact.model.js";
import PaymentMethodModel from "../../../../DB/model/paymentmethod.model.js";
import { sendEmail } from "../../../Services/email.js";

export const createOrder = async (req, res, next) => {
    const cart = await CartModel.findOne({ userId: req.user._id });
    if (!cart) {
        return next(new Error("cart is Empty", { cause: 400 }))
    }
    if (cart.products.length == 0) {
        return next(new Error("cart is Empty", { cause: 400 }))
    }
    req.body.products = cart.products;
    const currentDate = new Date();

    if (req.body.couponName) {
        const coupon = await CouponModel.findOne({ name: req.body.couponName.toLowerCase() });
        if (!coupon) {
            return next(new Error("coupon not found", { cause: 404 }));
        }

        if (coupon.expiredDate <= currentDate) {
            return next(new Error("this coupon has expired", { cause: 400 }));
        }

        if (coupon.usedBy.includes(req.user._id)) {
            return next(new Error(" coupon already used", { cause: 400 }));
        }
    }

    let subTotals = 0;
    let finalProductList = [];
    for (let product of req.body.products) {
        const checkProduct = await ProductModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
            status: "Active",
            expiredDate: { $gt: currentDate },
            isDeleted: 'false'

        })
        if (!checkProduct) {
            return next(new Error(`product '${product.name}' quantity not available`, { cause: 400 }));
        }
        product = product.toObject();
        product.name = checkProduct.name;
        product.slug = checkProduct.slug;
        product.unitPrice = checkProduct.price;
        product.discount = checkProduct.discount;
        product.finalPrice = product.quantity * checkProduct.finalPrice;

        subTotals += product.finalPrice;
        finalProductList.push(product);

    }
    const user = await UserModel.findById(req.user._id);

    if (!req.body.address) {
        req.body.address = user.address;
    }
    if (!req.body.phoneNumber) {
        req.body.phoneNumber = user.phoneNumber;
    }
    if (req.body.note) {
        req.body.note = user.phoneNumber;
    }
    let order;
    if (req.body.paymentType == 'visa') {
        const card = await PaymentMethodModel.findById(req.body.cardId);
        const cardDetails = {
            cardNumber: card.cardDetails.cardNumber,
            cardType: card.cardDetails.cardType,
            expiryDate: card.cardDetails.expiryDate,
            cvc: card.cardDetails.cvc,
            cardholderName: card.cardDetails.cardholderName,
            cardId: card._id
        }
        order = await OrderModel.create({
            userId: req.user._id,
            products: finalProductList,
            finalPrice: subTotals - (subTotals * (req.body.couponName?.amount || 0) / 100),
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            couponName: req.body.couponName !== '' ? req.body.couponName : '',
            city: req.body.city,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            note: req.body.note ?? '',
            paymentType: 'visa',
            cardDetails: cardDetails
        });

    }
    else {
        order = await OrderModel.create({
            userId: req.user._id,
            products: finalProductList,
            finalPrice: subTotals - (subTotals * (req.body.couponName?.amount || 0) / 100),
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            couponName: req.body.couponName !== '' ? req.body.couponName : '',
            city: req.body.city,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            note: req.body.note ?? '',
        });
    }
    if (order) {
        for (const product of req.body.products) {
            await ProductModel.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity, number_sellers: 1 } })
        }
        await CartModel.updateOne({ userId: req.user._id }, {
            products: [],
            totalPrice: 0
        })
        const coupon = await CouponModel.findOne({ name: req.body.couponName.toLowerCase() });
        await CouponModel.updateOne({ _id: coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    if (order.paymentType=== 'visa') {
        await sendEmail(user.email, "Order Made Successfully", ` 
        <!DOCTYPE html>
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
                                                                                        <div style="text-align:start; margin-left: 100px;">
                                                                                            <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName}</h2>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total Price: ₪${order.finalPrice}</h1>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In : ${order.createdAt}</h1> 
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total products:  ${order.products.length}</h1>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Payment Type:  ${order.paymentType}</h1>
                                                                                            <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Card Details: Card Number ${order.cardDetails.cardNumber} / expiry Date: ${order.cardDetails.expiryDate}/</p>
                                                                                            <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: You have 3 Days to Cancel Order, then you can not cancel</h3>
                                                                                            <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">Contact with us: we are going to send you contact information when your order is confirmed</h3>
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
        
    } else {
        await sendEmail(user.email, "Order Made Successfully", ` 
        <!DOCTYPE html>
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
                                                                                        <div style="text-align:start; margin-left: 100px;">
                                                                                            <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${user.userName}</h2>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total Price: ₪${order.finalPrice}</h1>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In : ${order.createdAt}</h1> 
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total products:  ${order.products.length}</h1>
                                                                                            <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Payment Type:  ${order.paymentType}</h1>
                                                                                            <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: You have 3 Days to Cancel Order, then you can not cancel</h3>
                                                                                            <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">Contact with us: we are going to send you contact information when your order is confirmed</h3>
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
        
    }

    return res.status(201).json({ message: 'success', order });
}

export const getAllOrders = async (req, res, next) => {
    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = OrderModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { status: { $regex: req.query.search, $options: 'i' } },
                { city: { $regex: req.query.search, $options: 'i' } },
                { 'updatedByUser.userName': { $regex: req.query.search, $options: 'i' } },
                { paymentType: { $regex: req.query.search, $options: 'i' } },

            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const orders = await mongooseQuery.sort(req.query.sort?.replaceAll(',', ' '));
    const deliveredOrder = await OrderModel.find({ status: 'delivered' }).count();
    const onWayOrder = await OrderModel.find({ status: 'onWay' }).count();
    const confirmedOrder = await OrderModel.find({ status: 'confirmed' }).count();
    const cancelledOrder = await OrderModel.find({ status: 'cancelled' }).count();
    const pendingOrder = await OrderModel.find({ status: 'pending' }).count();

    return res.status(201).json({ message: "success", orders, deliveredOrder: deliveredOrder, onWayOrder: onWayOrder, cancelledOrder: cancelledOrder, pendingOrder: pendingOrder, confirmedOrder: confirmedOrder });
}

export const getMyOrders = async (req, res, next) => {
    const { limit, skip } = pagination(req.query.page, req.query.limit);

    let queryObj = { ...req.query };
    const execQuery = ['page', 'limit', 'skip', 'sort', 'search', 'fields'];
    execQuery.map((ele) => {
        delete queryObj[ele];
    })
    queryObj = JSON.stringify(queryObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte|in|nin|eq|neq)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    const mongooseQuery = OrderModel.find(queryObj).limit(limit).skip(skip);
    if (req.query.search) {
        mongooseQuery.find({
            $or: [
                { status: { $regex: req.query.search, $options: 'i' } },
                { paymentType: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }
    if (req.query.fields) {
        mongooseQuery.select(req.query.fields?.replaceAll(',', ' '))
    }

    const orders = await mongooseQuery.find({ userId: req.user._id }).sort(req.query.sort?.replaceAll(',', ' '));
    if (!orders) {
        return next(new Error(` invalid order `, { cause: 404 }));
    }
    return res.status(201).json({ message: "success", orders });
}

export const getSpecificOrder = async (req, res, next) => {
    const order = await OrderModel.findById(req.params.orderId);
    if (!order) {
        return next(new Error(` order not found `, { cause: 404 }));
    }
    return res.status(201).json({ message: "success", order });
}

export const updateStatusOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.findById(orderId);
    if (!order) {
        return next(new Error(`order not found`, { cause: 404 }));
    }

    if (order.status == 'cancelled' || order.status == 'delivered') {
        return next(new Error(` can not change status this order `, { cause: 400 }));
    }

    if (order.status !== 'confirmed' && req.body.status == 'onWay') {
        return next(new Error(` can not change status its should be confirmed `, { cause: 400 }));
    }
    if (!order.contact && req.body.status == 'onWay') {
        return next(new Error(` can not change status you should add contact details to this Customer `, { cause: 400 }));
    }

    if (order.status !== 'onWay' && req.body.status == 'delivered') {
        return next(new Error(` can not change status its should be onWay `, { cause: 400 }));
    }
    const user = await UserModel.findById(req.user._id);

    req.body.updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const newOrder = await OrderModel.findByIdAndUpdate(orderId, req.body, { new: true });
    if (newOrder) {
        const orderUser = await UserModel.findById(newOrder.userId);

        await sendEmail(orderUser.email, `Order ${newOrder.status} Successfully`, `  <!DOCTYPE html>
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
                                                                                    <div style="text-align:start; margin-left: 100px;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${orderUser.userName}</h2>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total Price: ₪${newOrder.finalPrice}</h1>
                                                                                         <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In: ${newOrder.createdAt}</h1>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Contact : Contact Email: ${order.contact.adminEmail}/ Contact Phone: ${order.contact.adminPhoneNumber}</h1>

                                                                                        <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: if you have any questions Contact with Us</h3>
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
    }
    return res.status(201).json({ message: "success", order: newOrder });
}

export const addContactsOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
         const order = await OrderModel.findById(orderId);
        if (!order) {
            return next(new Error(`Order not found`, { cause: 404 }));
        }
        if (order.status != 'confirmed' && order.status != 'onWay') {
            return next(new Error(` can not add contact the order should be confirmed or onWay `, { cause: 409 }));
        }
        const user = await UserModel.findById(req.user._id);
        order.updatedByUser = {
            userName: user.userName,
            image: user.image,
            _id: user._id
        };
        const addedContact = await OrderContactModel.findOne({ _id: req.body.contactId, confirmEmail: "true" });
        if (!addedContact) {
            return next(new Error(`Contact not found`, { cause: 404 }));
        }
        const contact = {
            adminEmail: addedContact.email,
            adminPhoneNumber: addedContact.phoneNumber,
            _id: addedContact._id
        }

        order.contact = contact;

        // Save the updated order document
        await order.save();
        const orderUser = await UserModel.findById(order.userId);

        await sendEmail(orderUser.email, `Your Order Contact`, ` 
    <!DOCTYPE html>
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
                                                                                    <div style="text-align:start; margin-left: 100px;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${orderUser.userName}</h2>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total Price: ₪${order.finalPrice}</h1>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Contact : Contact Email: ${order.contact.adminEmail}/ Contact Phone: ${order.contact.adminPhoneNumber}</h1>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In: ${order.createdAt}</h1>
                                                                                        <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: if you have any questions Contact with Us</h3>
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
         return res.status(201).json({ message: "Success", order });
 };


export const cancelOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.findOne({ _id: orderId });

    if (!order) {
        return next(new Error(`Invalid order`, { cause: 404 }));
    }

    // Calculate the difference in days between the current time and the order's creation time
    const orderCreationTime = moment(order.createdAt);
    const currentTime = moment();
    const daysDifference = currentTime.diff(orderCreationTime, 'days');

    // Check if the order is older than 3 days
    if (daysDifference > 3) {
        return next(new Error(`Cannot cancel order: more than 3 days have passed since its creation`, { cause: 403 }));
    }

    if (order.status !== 'pending') {
        return next(new Error(`Cannot cancel order: order status is not pending`, { cause: 403 }));
    }

    req.body.status = 'cancelled';

    const user = await UserModel.findById(req.user._id);

    req.body.updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }

    for (const product of order.products) {
        await ProductModel.updateOne({ _id: product.productId }, { $inc: { stock: product.quantity, number_sellers: -1 } });
    }

    if (order.couponName) {
        await CouponModel.updateOne({ name: order.couponName }, { $pull: { usedBy: req.user._id } });
    }

    const newOrder = await OrderModel.findByIdAndUpdate(orderId, req.body, { new: true });
    if (newOrder) {
        const orderUser = await UserModel.findById(newOrder.userId);

        await sendEmail(orderUser.email, `Your Order Canceled Successfully`, ` 
    <!DOCTYPE html>
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
                                                                                    <div style="text-align:start; margin-left: 100px;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${orderUser.userName}</h2>
                                                                                         <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In : ${newOrder.createdAt}</h1>
                                                                                         <p style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color:red ;letter-spacing: 0.27px;">note: ${newOrder.reasonRejected}</p>
                                                                                         <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: if you used a coupon You can use it in the next order </h3>
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
    }
    return res.status(200).json({ message: "Order canceled successfully", newOrder });
}


export const confirmOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    const order = await OrderModel.findOne({ _id: orderId });

    if (!order) {
        return next(new Error(`Invalid order`, { cause: 404 }));
    }

    // Calculate the difference in days between the current time and the order's creation time
    const orderCreationTime = moment(order.createdAt);
    const currentTime = moment();
    const daysDifference = currentTime.diff(orderCreationTime, 'days');

    // Check if the order is older than 3 days
    if (daysDifference < 3) {
        return next(new Error(`Cannot confirm order: less than 3 days have passed since its creation`, { cause: 403 }));
    }

    if (order.status == 'cancelled') {
        return next(new Error(`Cannot confirm order the order is cancelled`, { cause: 403 }));
    }

    if (order.status !== 'pending') {
        return next(new Error(`Cannot confirm order: order status is not pending`, { cause: 403 }));
    }

    req.body.status = 'confirmed';
    const user = await UserModel.findById(req.user._id);

    req.body.updatedByUser = {
        userName: user.userName,
        image: user.image,
        _id: user._id
    }
    const newOrder = await OrderModel.findByIdAndUpdate(orderId, req.body, { new: true });
    if (newOrder) {
        const orderUser = await UserModel.findById(newOrder.userId);

        await sendEmail(orderUser.email, `Order ${newOrder.status} Successfully`, `  <!DOCTYPE html>
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
                                                                                    <div style="text-align:start; margin-left: 100px;">
                                                                                        <h2 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Hi ${orderUser.userName}</h2>
                                                                                        <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Total Price: ₪${newOrder.finalPrice}</h1>
                                                                                         <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Payment Type: ${newOrder.paymentType}</h1> 
                                                                                         <h1 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 18px;color: #4F545C;letter-spacing: 0.27px;">Made In: ${newOrder.createdAt}</h1> 
                                                                                        <h3 style="font-family: Whitney, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 14px;color:red ;letter-spacing: 0.27px;">note: You Can not cancel this order anymore</h3>
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
    }
    return res.status(200).json({ message: "Order Confirmed successfully", newOrder });
}
