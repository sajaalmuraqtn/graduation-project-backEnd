import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createService = Joi.object(
    {
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(2).max(150000).required(),
        price: Joi.number().positive().required(),
        discount: Joi.number().positive().min(1),
        file: generalFieldValidation.file.required(),
        status: Joi.string().valid('Active', 'Inactive'),
        advertisementId: Joi.string().required().min(24).max(24).required()
    }
)

export const updateService = Joi.object(
    {
        name: Joi.string().min(3).max(50),
        description: Joi.string().min(2).max(150000),
        price: Joi.number().positive(),
        discount: Joi.number().positive().min(1),
        file: generalFieldValidation.file,
        status: Joi.string().valid('Active', 'Inactive'),
        advertisementId: Joi.string().min(24).max(24).required(),
        serviceId: Joi.string().min(24).max(24).required()
    }
)

export const getSpecificService = Joi.object(
    {
        serviceId: Joi.string().min(24).max(24).required(),
        advertisementId: Joi.string().min(24).max(24).required()
    }
)
export const deleteService = Joi.object(
    {
        serviceId: Joi.string().min(24).max(24).required(),
        advertisementId: Joi.string().min(24).max(24).required()
    }
)

