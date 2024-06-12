import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const createAdvertisement = Joi.object(
    {
        name: Joi.string().min(3).max(50).required(),
        facebookLink: Joi.string(),
        instagramLink: Joi.string(),
        description: Joi.string().min(50).max(150000).required(),
        phoneNumber: Joi.string().min(10).max(10).required(),
        file: generalFieldValidation.file.required(),
        status: Joi.string().valid('Active', 'Inactive'),
        expiredDate: Joi.date().greater('now').required(),
        address: Joi.string().min(10).max(100),
        city: Joi.string().valid('Hebron','Nablus','Jerusalem','Ramallah','Tulkarm','Jenin','Al-Bireh','Jericho','Yatta','Beit Jala').required()
    }
)

export const updateAdvertisement = Joi.object(
    {
        name: Joi.string().min(3).max(50),
        facebookLink: Joi.string(),
        instagramLink: Joi.string(),
        description: Joi.string().min(50).max(150000),
        phoneNumber: Joi.string().min(10).max(10),
        file: generalFieldValidation.file,
        status: Joi.string().valid('Active', 'Inactive'),
        expiredDate: Joi.date().greater('now'),
        address: Joi.string().min(10).max(100),
        city: Joi.string().valid('Hebron','Nablus','Jerusalem','Ramallah','Tulkarm','Jenin','Al-Bireh','Jericho','Yatta','Beit Jala'),
        advertisementId: Joi.string().min(24).max(24).required()
    }
)
 
export const getSpecificAdvertisement = Joi.object(
    {
        advertisementId: Joi.string().min(24).max(24).required(),
    }
)

