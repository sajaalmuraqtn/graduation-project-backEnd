import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createCoupon= Joi.object(
    {
        name: Joi.string().min(3).max(40).required(),
        amount:Joi.number().positive().required(),
        file:generalFieldValidation.file.required(), 
        expiredDate:Joi.date().greater('now').required()
    }
   )
export const updateCoupon= Joi.object(
    {
        name: Joi.string().min(3).max(40) ,
        amount:Joi.number().positive(),
        file:generalFieldValidation.file , 
        expiredDate:Joi.date().greater('now'),
        couponId:Joi.string().required().min(24).max(24)
    }
   )
export const getSpecificCoupon= Joi.object(
    { 
        couponId:Joi.string().required().min(24).max(24)
    }
   )
export const deleteCoupon= Joi.object(
    { 
        couponId:Joi.string().required().min(24).max(24)
    }
   )