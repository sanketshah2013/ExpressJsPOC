let jwt = require('jsonwebtoken');
const auth = require('./storeAuth.js');

let checkToken = (req, res, next) => {
    let token = req.session && req.session.token; // Express headers are auto converted to lowercase
    if (token && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, auth.tokenKey, (err, decoded) => {
            if (err) {
                return {
                    success: false,
                    message: 'Token is not valid'
                };
            } else {
                req.decoded = decoded;
                req.decoded.authSuccess = true;
            }
        });
    } else {
        console.log("Auth token is not supplied");
        return {
            success: false,
            message: 'Auth token is not supplied'
        };
    }
};

module.exports = {
  checkToken: checkToken
}
