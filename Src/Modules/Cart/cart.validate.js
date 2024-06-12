import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createCart = Joi.object(
    { 
        quantity: Joi.number().integer().positive(),  
        productId: Joi.string().required().min(24).max(24) 
     }
)
export const removeItemCart = Joi.object(
    { 
         productId: Joi.string().required().min(24).max(24) 
     }
)