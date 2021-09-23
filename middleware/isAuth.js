const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    try {
    if (!authHeader) {
        req.isAuth = false
        return next()
    }
    const token = authHeader.split(' ')[1];

        const decodedToken = jwt.verify(token, 'somesupersecret');
        req.userId = decodedToken.userId;
        req.isAuth = true
        next();
    } catch(err) {
      req.isAuth = false
        return next()
    }

}