import { Router } from "express";
import * as UserController from './Controller/user.controller.js'
 import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js";
import fileUpload, { fileValidation } from "../../Services/multer.js";
import { generalFieldValidation, validation } from "../../Middleware/validation.js"
import * as validators from "./user.validation.js";


const router=Router({mergeParams:true});

router.get('/profile',auth(Object.values(roles)),asyncHandler(UserController.profile))
router.patch('/update',auth(Object.values(roles)),fileUpload(fileValidation.image).single('image'),validation(validators.updateProfile),asyncHandler(UserController.updateProfile))
router.get('/getAllUsers',auth(roles.Admin) ,asyncHandler(UserController.getAllUsers));
router.get('/getSpecificUser/:userId',auth(roles.Admin),validation(validators.getSpecificUser) ,asyncHandler(UserController.getSpecificUser));
router.get('/getActiveUsers',auth(roles.Admin) ,asyncHandler(UserController.getActiveUsers));
router.get('/getUnConfirmedUsers',auth(roles.Admin) ,asyncHandler(UserController.getUnConfirmedUsers));
 

export default router;