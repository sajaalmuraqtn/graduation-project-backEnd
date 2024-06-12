import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createFavorite = Joi.object(
    { 
         productId: Joi.string().required().min(24).max(24) 
     }
) 