import Joi from "joi";

export const addContact = Joi.object(
    {
        message:Joi.string().min(20).max(150000).required(),
        title: Joi.string().valid('Request an Advertisement','Support Team').required()
    }
)

export const getSpecificContactSupport = Joi.object(
    {
        contactSupportId: Joi.string().required().min(24).max(24) 
    }
)

export const addReplay = Joi.object(
    {
        contactSupportId: Joi.string().required().min(24).max(24),
        replay:Joi.string().min(20).max(150000).required()
    }
)
