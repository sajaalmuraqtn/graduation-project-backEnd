import Joi from "joi";
import { generalFieldValidation } from "../../Middleware/validation.js";

export const addContact = Joi.object(
    {
        email: generalFieldValidation.email,
        phoneNumber: Joi.string().min(10).max(10).required()
    }
)

export const deleteContact = Joi.object(
    {
        contactId: Joi.string().required().min(24).max(24) 
    }
)
