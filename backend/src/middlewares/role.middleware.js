/**
 * Role-based access control middleware
 * allowedRoles = array of roles allowed to access the route
 */

const roleMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        // req.user comes from auth.middleware
        if(!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied: insufficient permissions",
            });
        }

        // role allowed
        next();
    };
};

export default roleMiddleware;