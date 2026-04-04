var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.JSON_WEB_TOKEN_SECRET_KEY;
    return jwt({
        secret: secret,
        algorithms: ["HS256"],
    }).unless({
        path: [
            // Public Routes
            { url: /\/uploads(.*)/, methods: ['GET', 'OPTIONS'] }, // Images dikhane ke liye
            { url: /\/api\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/category(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/cart(.*)/, methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'] }, // Cart operations allow kiye
            
            // Auth Routes
            { url: /\/api\/user\/signin(.*)/, methods: ['POST', 'OPTIONS'] },
            { url: /\/api\/user\/signup(.*)/, methods: ['POST', 'OPTIONS'] },
      
{ url: /\/api\/productReviews(.*)/, methods: ['GET', 'POST', 'OPTIONS'] },
{ url: /\/api\/my-list(.*)/, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] },
{ url: /\/api\/orders(.*)/, methods: ['GET', 'POST', 'OPTIONS'] },
{ url: /\/api\/search(.*)/, methods: ['GET', 'OPTIONS'] },
{ url: /\/api\/user\/google-login(.*)/, methods: ['POST', 'OPTIONS'] },
{ url: /\/api\/user\/verifyemail(.*)/, methods: ['POST', 'OPTIONS'] },
{ url: /\/api\/user\/forgotPassword/, methods: ['POST'] },
{ url: /\/api\/user\/resetPassword/, methods: ['POST'] },
        ]
    });
}

module.exports = authJwt;