import { Router } from "express";
import * as ProductController from './Controller/product.controller.js'
import { auth, roles } from "../../Middleware/auth.js";
 import fileUpload, { fileValidation } from "../../Services/multer.js";
import { asyncHandler } from "../../Services/errorHandling.js";
import { validation } from "../../Middleware/validation.js";
 import ReviewRouter from "../Review/review.router.js"
import * as validators from './product.validation.js'
const router = Router()
 router.use('/:productId/review',ReviewRouter);
router.get('/', auth(roles.Admin), asyncHandler(ProductController.getAllProduct));
router.get('/:productId', validation(validators.getSpecificProduct), asyncHandler(ProductController.getSpecificProduct));
router.get('/allProducts/active', asyncHandler(ProductController.getActiveProduct));
router.get('/category/:categoryId', validation(validators.getProductWithCategory), asyncHandler(ProductController.getProductWithCategory));
router.post('/', auth(roles.Admin),fileUpload(fileValidation.image).single('mainImage'), validation(validators.createProduct), asyncHandler(ProductController.createProduct));
router.put('/:productId', auth(roles.Admin),fileUpload(fileValidation.image).single('mainImage'), validation(validators.updateProduct), asyncHandler(ProductController.updateProduct));
router.put('/restore/:productId', auth(roles.Admin), validation(validators.deleteProduct), asyncHandler(ProductController.restoreProduct));
router.put('/softDelete/:productId', auth(roles.Admin), validation(validators.deleteProduct), asyncHandler(ProductController.softDeleteProduct));
router.delete('/hardDelete/:productId', auth(roles.Admin), validation(validators.deleteProduct), asyncHandler(ProductController.hardDeleteProduct));
export default router;