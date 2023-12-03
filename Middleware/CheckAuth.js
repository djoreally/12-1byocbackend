const jwt = require("jsonwebtoken");

const CheckAuth = (req, res, next) => {
   const { authorization } = req.headers;
  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT);
    const { email, userId } = decoded;
    req.email = email;
    req.userId = userId;
    next();
  } catch (err) {
    res.status(500).json({
      loggedIn: false,
      message: "Authentication failure!",
    });
  }
};

module.exports = CheckAuth;
