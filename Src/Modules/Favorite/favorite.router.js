import { Router } from "express";
import * as FavoriteController from './Controllers/favorite.controller.js'
import { auth, roles } from "../../Middleware/auth.js";
 import { validation } from "../../Middleware/validation.js";
import * as validators from './favoriter.validation.js'


const router=Router();

router.post('/', auth(roles.User) ,validation(validators.createFavorite),FavoriteController.createFavorite);
router.patch('/removeItem', auth(roles.User) ,validation(validators.createFavorite),FavoriteController.removeItem);
router.delete('/clearFavorite',auth(roles.User),FavoriteController.clearFavorite);
router.get('/', auth(roles.User) ,FavoriteController.getFavorite);

export default router;
