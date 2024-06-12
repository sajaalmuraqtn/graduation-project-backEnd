import Joi from "joi"

export const addPayment = Joi.object(
    {
        cardNumber: Joi.string().required().trim().length(16).required(),
        expiryDate: Joi.string().required().trim().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).message('Expiry date must be in MM/YY format').required(),
        cvc: Joi.string().required().trim().pattern(/^[0-9]{3,4}$/).message('CVC must be 3 or 4 digits').required(),
        cardholderName: Joi.string().required().trim().min(3).max(50).required()

    }
)

export const getSpecificPaymentMethod= Joi.object(
    {
        paymentMethodId:Joi.string().required().min(24).max(24) 
    }
)
