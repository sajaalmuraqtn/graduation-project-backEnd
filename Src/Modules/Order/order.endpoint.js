import { roles } from "../../Middleware/auth.js"

export const endPoint={
    create:[roles.User],
    updateOrder:[roles.Admin],
    getAll:[roles.Admin],
    getMy:[roles.User],
    cancel:[roles.User],
    changeStatus:[roles.Admin]
}