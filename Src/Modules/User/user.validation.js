import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"


export const updateProfile = Joi.object(
    {
        userName: Joi.string().min(4).max(30),
        phoneNumber: Joi.string().min(10).max(10),
        address: Joi.string().min(10).max(100),
        file: generalFieldValidation.file,
    }
)

export const getSpecificUser = Joi.object(
    {
        userId: Joi.string().required().min(24).max(24)
    }
)