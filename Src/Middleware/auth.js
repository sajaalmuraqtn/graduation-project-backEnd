import Jwt from "jsonwebtoken";
import UserModel from "../../DB/model/user.model.js";

export const roles = {
    Admin: 'Admin',
    User: 'User'
}
export const auth = (accessRoles = []) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;

            if (!authorization?.startsWith(process.env.BEARERTOKEN)) {
                return next(new Error("invalid authorization", { cause: 400 }));
            }

            const token = authorization.split(process.env.BEARERTOKEN)[1];
            const decoded = await Jwt.verify(token, process.env.LOGINSECRET);
            if (!decoded) {
                return next(new Error("invalid authorization", { cause: 400 }));
            }

            const user = await UserModel.findById(decoded.id).select('userName role changePasswordTime');

            if (!user) {
                return next(new Error("not registered user", { cause: 404 }));

            }
            if (user.changePasswordTime && parseInt(user.changePasswordTime.getTime() / 1000) > decoded.iat) {
                return next(new Error("expired token, please login", { cause: 400 }));
            }
            if (!accessRoles.includes(user.role)) {
                return next(new Error("not auth user", { cause: 403 }));
            }
            req.user = user
            next()
        } catch (error) {
            return res.json({ error: error.stack });
        }

    }
}