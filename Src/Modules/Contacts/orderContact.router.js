import { Router } from "express";
import * as ContactController from './controllers/orderContact.controllers.js'
import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js";
import { generalFieldValidation, validation } from "../../Middleware/validation.js"
import * as validators from "./orderContact.validation.js";
const router = Router();

router.post('/create', auth(roles.Admin), validation(validators.addContact), asyncHandler(ContactController.addContact))
router.get('/confirmEmail/:token', asyncHandler(ContactController.confirmEmail));
router.get('/getAllContacts', auth(roles.Admin), asyncHandler(ContactController.getAllContacts));
router.get('/getConfirmedContacts', auth(roles.Admin), asyncHandler(ContactController.getConfirmedContacts));
router.delete('/deleteUnConfirmedContacts', auth(roles.Admin), asyncHandler(ContactController.deleteUnConfirmedContacts));
router.delete('/delete/:contactId', auth(roles.Admin), validation(validators.deleteContact), asyncHandler(ContactController.deleteContact));


export default router;