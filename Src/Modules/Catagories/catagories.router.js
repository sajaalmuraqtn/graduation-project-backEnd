import { Router } from "express";
import * as CatagoriesController from './Controller/catagories.controller.js'
 import fileUpload, { fileValidation } from "../../Services/multer.js";
import { auth, roles } from "../../Middleware/auth.js";
import { endPoint } from "./category.endpoint.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import * as validators from "./category.validation.js";
import { validation } from "../../Middleware/validation.js";

const router=Router();

 router.get('/',auth(endPoint.getall),asyncHandler(CatagoriesController.getCatagories));
router.get('/active',asyncHandler(CatagoriesController.getActiveCategory));
router.get('/LatestNewActiveCategory',asyncHandler(CatagoriesController.getLatestNewActiveCategory));
router.get('/:categoryId',validation(validators.getSpecificCategory),asyncHandler(CatagoriesController.getSpecificCategory));

router.post('/create',auth(endPoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),asyncHandler(CatagoriesController.createCategory))
router.put('/:categoryId',auth(endPoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateCategory),asyncHandler(CatagoriesController.updateCategory));
router.put('/softDelete/:categoryId',auth(endPoint.delete),validation(validators.deleteCategory) ,asyncHandler(CatagoriesController.softDeleteCategory));
router.put('/restore/:categoryId',auth(endPoint.delete),validation(validators.deleteCategory) ,asyncHandler(CatagoriesController.restoreCategory));
router.delete('/hardDelete/:categoryId',auth(endPoint.delete) ,validation(validators.deleteCategory),asyncHandler(CatagoriesController.hardDeleteCategory));
export default router;
