const User = require("../db/models/user.schema");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.utils");
const jwt = require("jsonwebtoken");

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError("User already exists", 400);
    }

    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User does not exist", 400);
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AppError("Invalid credentials", 400);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

const refreshAuthToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken,
    });
    if (!user) throw new AppError("Invalid refresh token", 401);

    const newAccessToken = generateAccessToken({ _id: decoded.userId });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const user = await User.findOne({ _id: req.user.userId, refreshToken });

    if (!user) {
      throw new AppError("Invalid refresh token", 401);
    }

    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  signIn,
  refreshAuthToken,
  logout,
};
