const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const { authorization: token } = req.headers;

  if (!token) {
    return res.status(401).json({ error: "No Token Provided" });
  }
  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.ACCESS_TOKEN_SECRET,
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = authMiddleware;
