import { Router } from "express";
import * as AdvertisementController from './Controller/advertisement.controller.js'
import ServiceRouter from '../service/service.router.js'
import { auth, roles } from "../../Middleware/auth.js";
 import fileUpload, { fileValidation } from "../../Services/multer.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import { validation } from "../../Middleware/validation.js";
 import * as validators from './advertisement.validation.js'
const router = Router()
router.use('/:advertisementId/services',validation(validators.getSpecificAdvertisement),ServiceRouter);

router.get('/', auth(roles.Admin), asyncHandler(AdvertisementController.getAllAdvertisement));
router.get('/:advertisementId', validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.getSpecificAdvertisement));
router.get('/admin/:advertisementId', auth(roles.Admin), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.getSpecificAdvertisementAdmin));
router.get('/allAdvertisements/active', asyncHandler(AdvertisementController.getActiveAdvertisement));
router.post('/', auth(roles.Admin),fileUpload(fileValidation.image).single('mainImage'), validation(validators.createAdvertisement), asyncHandler(AdvertisementController.createAdvertisement));
router.put('/:advertisementId', auth(roles.Admin), fileUpload(fileValidation.image).single('mainImage'), validation(validators.updateAdvertisement), asyncHandler(AdvertisementController.updateAdvertisement));
router.patch('/restore/:advertisementId', auth(roles.Admin), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.restoreAdvertisement));
router.patch('/softDelete/:advertisementId', auth(roles.Admin), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.softDeleteAdvertisement));
router.delete('/hardDelete/:advertisementId', auth(roles.Admin), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.hardDeleteAdvertisement));
export default router;