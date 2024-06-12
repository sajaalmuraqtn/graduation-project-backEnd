import Joi from "joi";

export const generalFieldValidation = {
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required().messages({
        "string.min": "password must be at least 8 char"
    }),
    file: Joi.object({
        fieldname:Joi.required(),
        originalname:Joi.required(),
        encoding:Joi.required(),
        mimetype:Joi.required(),
        destination:Joi.required(),
        filename:Joi.required(),
        path:Joi.required(),
        size:Joi.number().positive().required()
}
    )}

export const validation=(schema)=>{
    return (req,res,next)=>{
        const inputsData={...req.body,...req.params,...req.query};
        if (req.file || req.files) {
            inputsData.file=req.file|| req.files;
        }
        const validationResult=schema.validate(inputsData,{abortEarly:false});
        if (validationResult.error?.details){
           return res.status(400).json({message:'validation Error',validationError:validationResult.error?.details})
        }
       next()
    }
}