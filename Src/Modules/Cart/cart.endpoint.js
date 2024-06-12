import { roles } from "../../Middleware/auth.js"

export const endPoint={
    create:[roles.User],
    removeItem:[roles.User],
    clearCart:[roles.User],
    getCart:[roles.User]
  
}