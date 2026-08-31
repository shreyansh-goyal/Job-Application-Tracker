const jwt = require("jsonwebtoken");
const env = require("../config/env");

const authMiddleware = (req, res, next) => {
  const { authorization: token } = req.headers;

  if (!token) {
    return res.status(401).json({ error: "No Token Provided" });
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], env.jwtAccessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = authMiddleware;
