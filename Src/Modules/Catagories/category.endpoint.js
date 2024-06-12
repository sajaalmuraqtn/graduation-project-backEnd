import { roles } from "../../Middleware/auth.js"

export const endPoint={
    create:[roles.Admin],
    getall:[roles.Admin],
    update:[roles.Admin],
    delete:[roles.Admin],
}