import jwt from "jsonwebtoken";


const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.json({ success: false, message: 'Unauthorized!' })
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (decodedToken.id) {
            if (!req.body) req.body = {};
            req.body.userID = decodedToken.id;
        } else {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export default userAuth;