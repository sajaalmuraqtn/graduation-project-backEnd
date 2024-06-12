import Joi from "joi"
 
export const createReview= Joi.object(
    { 
        comment:Joi.string().min(10).max(100).required(),
        rating :Joi.number().integer().positive().valid(1,2,3,4,5).required(),
        productId:Joi.string().required().min(24).max(24).required(),
     }
   )

 