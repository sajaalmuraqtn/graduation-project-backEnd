import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createCategory= Joi.object(
    {
        name: Joi.string().required().min(5).max(30),
        file:generalFieldValidation.file.required(),
        status: Joi.string().valid('Active', 'Inactive'), 
    }
   )
export const updateCategory= Joi.object(
    {
        categoryId: Joi.string().required().min(24).max(24),
        name: Joi.string().min(5).max(30),
        status: Joi.string().valid('Active', 'Inactive'), 
        file:generalFieldValidation.file 
    }
   )
 
export const getSpecificCategory= Joi.object(
    {
        categoryId: Joi.string().required().min(24).max(24),

    }
   )
export const deleteCategory= Joi.object(
    {
        categoryId: Joi.string().required().min(24).max(24), 
    }
   )
