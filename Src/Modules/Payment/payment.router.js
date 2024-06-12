import { Router } from "express";
 import { auth, roles } from "../../Middleware/auth.js";
import * as PaymentMethodController from "./controller/payment.controller.js"
import * as validators from "./payment.validation.js"
import { validation } from "../../Middleware/validation.js"; 
import { asyncHandler } from "../../Services/errorHandling.js";
const router=Router();

router.post('/AddPayment' ,auth(roles.User),validation(validators.addPayment) ,asyncHandler(PaymentMethodController.createPaymentMethod));
router.get('/getSpecificPaymentMethod/:paymentMethodId' ,auth(Object.values(roles)),validation(validators.getSpecificPaymentMethod) ,asyncHandler(PaymentMethodController.getSpecificPaymentMethod));
router.delete('/deletePaymentMethod/:paymentMethodId' ,auth(roles.User),validation(validators.getSpecificPaymentMethod) ,asyncHandler(PaymentMethodController.deletePaymentMethod));
router.get('/getPaymentMethods' ,auth(roles.User) ,asyncHandler(PaymentMethodController.getPaymentMethod));

export default router;
