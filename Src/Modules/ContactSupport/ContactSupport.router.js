import { Router } from "express";
import * as ContactSupportController from './controllers/ContactSupport.controllers.js'
import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js";
import {validation } from "../../Middleware/validation.js"
import * as validators from "./ContactSupport.validation.js";
const router = Router();

router.post('/create', auth(roles.User), validation(validators.addContact), asyncHandler(ContactSupportController.addContact))
router.get('/getAllContacts', auth(roles.Admin), asyncHandler(ContactSupportController.getAllContacts));
router.get('/getSpecificContactSupport/:contactSupportId', auth(roles.Admin),validation(validators.getSpecificContactSupport), asyncHandler(ContactSupportController.getSpecificContactSupport));
router.put('/Replay/:contactSupportId', auth(roles.Admin),validation(validators.addReplay), asyncHandler(ContactSupportController.addReplay));

export default router;