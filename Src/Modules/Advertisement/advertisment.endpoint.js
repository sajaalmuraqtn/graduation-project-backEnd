import { roles } from "../../Middleware/auth.js"

export const endPoint={
    create:[roles.Admin],
    getall:[roles.Admin],
    update:[roles.Center],
    delete:[roles.Center] 
}