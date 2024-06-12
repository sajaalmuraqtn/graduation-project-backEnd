import Joi from "joi"
import { generalFieldValidation } from "../../Middleware/validation.js"

export const AddAdminAccount = Joi.object(
    {
        userName: Joi.string().min(4).max(30).required(),
        email: generalFieldValidation.email,
        password: generalFieldValidation.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        phoneNumber: Joi.string().min(10).max(10).required(),
        file: generalFieldValidation.file.required(),
    }
)

export const signUp = Joi.object(
    {
        userName: Joi.string().min(4).max(30).required(),
        email: generalFieldValidation.email,
        password: generalFieldValidation.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        phoneNumber: Joi.string().min(10).max(10).required(),
        address: Joi.string().min(10).max(100).required(),
        file: generalFieldValidation.file.required(),
    }
)

export const signIn = Joi.object(
    {
        email: generalFieldValidation.email,
        password: generalFieldValidation.password.required(),
    }
)
export const adminSignIn = Joi.object(
    {
        email: generalFieldValidation.email,
        password: generalFieldValidation.password.required(),
    }
)

export const forgotPassword = Joi.object(
    {
        email: generalFieldValidation.email.required(),
        password: generalFieldValidation.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        code:Joi.string()
    }
)

export const changePassword = Joi.object(
    {
        lastPassword: generalFieldValidation.password.required(),
        newPassword: generalFieldValidation.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    }
)