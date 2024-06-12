import { Router } from "express";
import * as CartController from './Controller/cart.controller.js'
import { auth, roles } from "../../Middleware/auth.js";
import { endPoint } from "./cart.endpoint.js";
import { validation } from "../../Middleware/validation.js";
import * as validators from './cart.validate.js'


const router=Router();

router.post('/',auth(endPoint.create),validation(validators.createCart),CartController.createCart);
router.patch('/removeItem',auth(endPoint.removeItem),validation(validators.removeItemCart),CartController.removeItem);
router.patch('/clearCart',auth(endPoint.clearCart),CartController.clearCart);
router.get('/',auth(endPoint.getCart),CartController.getCart);
export default router;
