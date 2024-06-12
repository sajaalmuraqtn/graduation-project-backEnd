import  Router  from "express";
import * as CouponController from './Controller/coupon.controller.js'
import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js"; 
import * as validators from "./coupon.validation.js"
import { validation } from "../../Middleware/validation.js";
import fileUpload, { fileValidation } from "../../Services/multer.js";

const router=Router();

router.post('/create',auth(roles.Admin),fileUpload(fileValidation.image).single('image'),validation(validators.createCoupon),asyncHandler(CouponController.CreateCoupon));
router.get('/',auth(roles.Admin),asyncHandler(CouponController.GetAllCoupons));
router.get('/active',asyncHandler(CouponController.getActiveCoupons ));
router.put('/:couponId',auth(roles.Admin),fileUpload(fileValidation.image).single('image'),validation(validators.updateCoupon),asyncHandler(CouponController.UpdateCoupon));
router.get('/:couponId',auth(roles.Admin),validation(validators.getSpecificCoupon),asyncHandler(CouponController.GetSpecificCoupons));
router.patch('/softDelete/:couponId',auth(roles.Admin),validation(validators.deleteCoupon),asyncHandler(CouponController.SoftDelete));
router.delete('/hardDelete/:couponId',auth(roles.Admin),validation(validators.deleteCoupon),asyncHandler(CouponController.HardDelete));
router.patch('/restore/:couponId',auth(roles.Admin),validation(validators.deleteCoupon),asyncHandler(CouponController.Restore));


export default router;