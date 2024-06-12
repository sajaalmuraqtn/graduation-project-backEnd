import { Router } from "express";
import * as AuthController from './Controller/auth.controller.js'
import fileUpload, { fileValidation } from "../../Services/multer.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js";
import { validation } from "../../Middleware/validation.js";
import * as validators from "./auth.validatiion.js";

 const router=Router();

router.post('/signUp',fileUpload(fileValidation.image).single('image'),validation(validators.signUp),validation(validators.signUp),asyncHandler(AuthController.signUp));
router.post('/signIn',validation(validators.signIn) ,asyncHandler(AuthController.signIn));
router.post('/addAdminAccount' ,fileUpload(fileValidation.image).single('image'),validation(validators.AddAdminAccount),asyncHandler(AuthController.AddAdminAccount));
router.post('/adminSignIn' ,asyncHandler(AuthController.adminSignIn));
router.get('/confirmEmail/:token' ,asyncHandler(AuthController.confirmEmail));
router.patch('/sendCode',asyncHandler(AuthController.sendCode));
router.patch('/forgotPassword',validation(validators.forgotPassword),asyncHandler(AuthController.forgotPassword));
router.patch('/changePassword',auth(Object.values(roles)),validation(validators.changePassword),asyncHandler(AuthController.changePassword));
router.delete('/deleteInvalidConfirm',auth(roles.Admin) ,asyncHandler(AuthController.deleteInvalidConfirm));


export default router;