const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
let jwt = require('jsonwebtoken');
let auth = require('./storeAuth.js');
let authValidate = require('./authValidate.js');

class HandlerGenerator {
    login (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        console.log("Username: " + username + ", Password: " + password);
        let mockUser = 'admin';
        let mockPwd = 'password';

        if (username && password) {
            if (username === mockUser && mockPwd === mockPwd) {
                let token = jwt.sign({username: username}, auth.tokenKey);
                // return the JWT token for the future API calls
                return {
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                }
            } else {
                /* res.send(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                }); */
                return {
                    success: false,
                    errorCode: 403,
                    message: 'Incorrect username or password'
                }
            }
        } else {
            return {
                success: false,
                errorCode: 400,
                message: 'Authentication failed! Please check the request'
            };
        }
    }
    index (req, res) {
        res.json({
            success: true,
            message: 'Index page'
        });
    }
}

// Starting point of authLogin
function main () {
    let app = express(); // Export app for other routes to use
    let handlers = new HandlerGenerator();
    const port = process.env.PORT || 8080;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(session({secret: "TokenKey"}));
    // Routes & Handlers
    app.post('/login', (req, res) => {
        let loginCheck = handlers.login(req, res);
        if(loginCheck.success) {
            req.session.token = loginCheck.token;
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(loginCheck.message);
            res.write('<br>Welcome ' + req.body.username + '!');
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(loginCheck.message);
            res.write('<br><a href="/">Back</a>');
            res.end();
        }
    });
    
    app.get('/', (req,res) => {
        console.log(req.session);
        let authCheck = authValidate.checkToken(req, res);
        console.log(authCheck);
        if(authCheck && !authCheck.success) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            //res.write(authCheck.message);
            res.write("<div><form action='/login' method='post'>");
            res.write("<p><label>Username: <input type='text' required name='username'></label></p>");
            res.write("<p><label>Password: <input type='password' required name='password'></label></p>");
            res.write("<input type='submit' value='Submit'></form></div>");
            res.end();
        } else if (!authCheck && req.decoded.authSuccess) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("<div><p>Hello " + req.decoded.username + "</p>");
            res.write("<p>You are already logged in!</p>");
            res.end();
        }
    });
    app.listen(port, () => console.log(`Server is listening on port: ${port}`));
}

main();
