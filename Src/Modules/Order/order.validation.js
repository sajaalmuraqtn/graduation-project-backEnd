import Joi from "joi"
  
export const createOrder= Joi.object(
    {
        firstName:Joi.string().min(3).max(30).required(),
        lastName:Joi.string().min(3).max(30).required(),
        couponName: Joi.string().min(3).max(30).optional().allow(''), 
        phoneNumber: Joi.string().min(10).max(10),
        note: Joi.string().min(10).max(100).optional().allow(''),
        address: Joi.string().min(10).max(100),
        paymentType: Joi.string().required(),
        cardId: Joi.string().min(24).max(24).optional().allow(''),
        city: Joi.string().valid('Hebron','Nablus','Jerusalem','Ramallah','Tulkarm','Jenin','Al-Bireh','Jericho','Yatta','Beit Jala').required()
     }
   )


export const addContactOrder= Joi.object(
    {
        contactId:Joi.string().required().min(24).max(24),
        orderId:Joi.string().required().min(24).max(24)
    }
)

export const updateStatusOrder= Joi.object(
    {
        orderId:Joi.string().required().min(24).max(24),
        status: Joi.string().valid('onWay','delivered').required(),  
    }
)

export const cancelOrder = Joi.object(
    { 
        orderId:Joi.string().required().min(24).max(24),
        reasonRejected:Joi.string().required().min(50).max(200) 
    }
   )
export const confirmOrder = Joi.object(
    { 
        orderId:Joi.string().required().min(24).max(24)
    }
   )

export const getSpecificOrders= Joi.object(
    { 
        orderId:Joi.string().required().min(24).max(24)
    }
   ) 