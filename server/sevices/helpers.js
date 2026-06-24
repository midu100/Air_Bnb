const jwt = require("jsonwebtoken");

const generateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
};

const generateAccToken = (user) => {
  try {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_TOKEN,
      { expiresIn: "2h" },
    );
  } catch (error) {
    console.log(error);
  }
};

const generateRefreshToken = (user) => {
  try {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_TOKEN,
      { expiresIn: "10d" },
    );
  } catch (error) {
    console.log(error);
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    return decoded
  } catch (err) {
    return null
  }
};

module.exports = { generateOTP, generateAccToken, generateRefreshToken,verifyToken };
