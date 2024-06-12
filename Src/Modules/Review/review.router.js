import { Router } from "express";
import { asyncHandler } from "../../Services/errorHandling.js";
import * as ReviewController from './Controller/review.controller.js'
import * as validators from "./review.validation.js"
import { validation } from "../../Middleware/validation.js"; 

import { auth, roles } from "../../Middleware/auth.js";

const router=Router({mergeParams:true})

router.post('/create',auth(roles.User),validation(validators.createReview),asyncHandler(ReviewController.createReview));

export default router;