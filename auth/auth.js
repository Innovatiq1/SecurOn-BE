import jwt from "jsonwebtoken";

// use this to verify a JWT token on API routes
export const verifyTokenAuth = (req, res, next) => {
  //passport.authenticate('jwt', { session: false});
  let token = req.headers["authtoken"];
  token = token.replace("Bearer ", "");
   if (token) {
    jwt.verify(
      token,
      "1XFgo6D28BAssDOKFSm7TehOqwfPT0PF",
      function (err, decoded) {
        if (err) {
          res.status(401).json({ message: "Invalid token." });
          return;
        }
        next();
      }
    );
  } else {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const generateToken = (data) => {

  return jwt.sign(data, "1XFgo6D28BAssDOKFSm7TehOqwfPT0PF");
  
};
