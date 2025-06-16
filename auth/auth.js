// import jwt from "jsonwebtoken";

// // use this to verify a JWT token on API routes
// export const verifyTokenAuth = (req, res, next) => {
//   //passport.authenticate('jwt', { session: false});
//   let token = req.headers["authtoken"];
//   token = token.replace("Bearer ", "");
//    if (token) {
//     jwt.verify(
//       token,
//       "1XFgo6D28BAssDOKFSm7TehOqwfPT0PF",
//       function (err, decoded) {
//         if (err) {
//           res.status(401).json({ message: "Invalid token." });
//           return;
//         }
//         next();
//       }
//     );
//   } else {
//     res.status(401).json({ message: "Invalid token." });
//   }
// };

// export const generateToken = (data) => {

//   return jwt.sign(data, "1XFgo6D28BAssDOKFSm7TehOqwfPT0PF");
  
// };
import { expressjwt } from 'express-jwt';

import jwksRsa from 'jwks-rsa';
import jsonwebtoken from 'jsonwebtoken';

const tenantId = '1b255047-44c1-4d68-a1e3-22b00348e5ee';
const audience = 'api://97cbe69d-9da9-4c94-9ea7-304d864582f5';

export const verifyTokenAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5
  }),
  audience: audience,
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  algorithms: ['RS256']
});

export const generateToken = (data) => {
  return jsonwebtoken.sign(data, "1XFgo6D28BAssDOKFSm7TehOqwfPT0PF");
};