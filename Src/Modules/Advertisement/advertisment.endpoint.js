import { roles } from "../../Middleware/auth.js"

export const endPoint={
    create:[roles.Center],
    getall:[roles.Admin,roles.Center],
    update:[roles.Center],
    delete:[roles.Center] 
}