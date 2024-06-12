import { Router } from "express";
import { endPoint } from "./order.endpoint.js";
import { auth, roles } from "../../Middleware/auth.js";
import * as OrderController from "./Controller/order.controller.js"
import * as validators from "./order.validation.js"
import { validation } from "../../Middleware/validation.js"; 
import { asyncHandler } from "../../Services/errorHandling.js";

const router=Router();

router.post('/',auth(endPoint.create),validation(validators.createOrder),asyncHandler(OrderController.createOrder));
router.patch('/cancel/:orderId',auth(Object.values(roles)),validation(validators.cancelOrder) ,asyncHandler(OrderController.cancelOrder));
router.patch('/confirm/:orderId',auth(roles.Admin),validation(validators.confirmOrder) ,asyncHandler(OrderController.confirmOrder));
router.patch('/addContact/:orderId',auth(roles.Admin),validation(validators.addContactOrder) ,asyncHandler(OrderController.addContactsOrder));
router.get('/',auth(endPoint.getAll),asyncHandler(OrderController.getAllOrders));
router.get('/MyOrders',auth(endPoint.getMy),asyncHandler(OrderController.getMyOrders));
router.get('/:orderId',auth(Object.values(roles)),validation(validators.getSpecificOrders),asyncHandler(OrderController.getSpecificOrder ));
router.put('/updateStatusOrder/:orderId',auth(endPoint.updateOrder),validation(validators.updateStatusOrder),asyncHandler(OrderController.updateStatusOrder));
 
export default router;
