import { Router } from "express";
import * as ServiceController from './Controllers/service.controllers.js'
import { validation } from "../../Middleware/validation.js";
import * as validators from "./service.validation.js";
import fileUpload, { fileValidation } from "../../Services/multer.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import { auth, roles } from "../../Middleware/auth.js";
import { endPoint } from "./service.endpoint.js";

const router=Router({mergeParams:true});

router.get('/', auth(endPoint.getall), asyncHandler(ServiceController.getAllServices));
router.get('/:serviceId', validation(validators.getSpecificService), asyncHandler(ServiceController.getSpecificService));
router.get('/allServices/active', asyncHandler(ServiceController.getActiveService));
router.post('/', auth(roles.Admin),fileUpload(fileValidation.image).single('mainImage'), validation(validators.createService), asyncHandler(ServiceController.createService));
router.put('/update/:serviceId', auth(roles.Center),fileUpload(fileValidation.image).single('mainImage'), validation(validators.updateService), asyncHandler(ServiceController.updateService));
router.patch('/restore/:serviceId', auth(roles.Center), validation(validators.deleteService), asyncHandler(ServiceController.restoreService));
router.patch('/softDelete/:serviceId', auth(roles.Center), validation(validators.deleteService), asyncHandler(ServiceController.softDeleteService));
router.delete('/hardDelete/:serviceId', auth(roles.Center), validation(validators.deleteService), asyncHandler(ServiceController.hardDeleteService));

export default router;