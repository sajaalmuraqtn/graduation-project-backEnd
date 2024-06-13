import { Router } from "express";
import * as AdvertisementController from './Controller/advertisement.controller.js'
import ServiceRouter from '../service/service.router.js'
import { auth, roles } from "../../Middleware/auth.js";
 import fileUpload, { fileValidation } from "../../Services/multer.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import { validation } from "../../Middleware/validation.js";
 import * as validators from './advertisement.validation.js'
import { endPoint } from "./advertisment.endpoint.js";
const router = Router()
router.use('/:advertisementId/services',validation(validators.getSpecificAdvertisement),ServiceRouter);
router.get('/getAllCenterProviders', auth(roles.Admin), asyncHandler(AdvertisementController.getAllCenterProviders));
router.post('/addCenterProvider', auth(roles.Admin) ,fileUpload(fileValidation.image).single('image'), asyncHandler(AdvertisementController.addCenterProvider));
router.put('/updateCenterProvider/:centerProviderId', auth(roles.Center) ,fileUpload(fileValidation.image).single('image'),validation(validators.updateCenterProvider), asyncHandler(AdvertisementController.updateCenterProvider));
router.patch('/updateCenterProviderExpiredDate/:centerProviderId', auth(roles.Admin) ,fileUpload(fileValidation.image).single('image'),validation(validators.updateCenterProvider), asyncHandler(AdvertisementController.updateCenterProviderExpiredDate));
router.get('/getSpecificProvider/:centerProviderId', auth(endPoint.getall),validation(validators.getSpecificCenterProvider), asyncHandler(AdvertisementController.getSpecificCenterProvider));
router.get('/confirmEmail/:token', asyncHandler(AdvertisementController.confirmEmail));
//////////////////////////////////////////
router.get('/', auth(endPoint.getall), asyncHandler(AdvertisementController.getAllAdvertisement));
router.get('/:advertisementId', validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.getSpecificAdvertisement));
router.get('/admin/:advertisementId', auth(endPoint.getall), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.getSpecificAdvertisementAdmin));
router.get('/allAdvertisements/active', asyncHandler(AdvertisementController.getActiveAdvertisement));
router.get('/getMyAdvertisements',auth(roles.Center), asyncHandler(AdvertisementController.getActiveAdvertisement));
router.post('/', auth(roles.Center),fileUpload(fileValidation.image).single('mainImage'), validation(validators.createAdvertisement), asyncHandler(AdvertisementController.createAdvertisement));
router.put('/:advertisementId', auth(roles.Center), fileUpload(fileValidation.image).single('mainImage'), validation(validators.updateAdvertisement), asyncHandler(AdvertisementController.updateAdvertisement));
router.patch('/restore/:advertisementId', auth(roles.Center), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.restoreAdvertisement));
router.patch('/softDelete/:advertisementId', auth(roles.Center), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.softDeleteAdvertisement));
router.delete('/hardDelete/:advertisementId', auth(roles.Center), validation(validators.getSpecificAdvertisement), asyncHandler(AdvertisementController.hardDeleteAdvertisement));
export default router;