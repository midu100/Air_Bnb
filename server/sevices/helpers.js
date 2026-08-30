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

// ====== Cookie options - secure/sameSite follow HTTPS automatically
// httpOnly keeps tokens out of document.cookie so an XSS payload cannot read them
const getCookieOptions = (req, maxAge) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
    maxAge
  }
}

const ACCESS_COOKIE_AGE = 2 * 60 * 60 * 1000        // 2h - matches the access token
const REFRESH_COOKIE_AGE = 10 * 24 * 60 * 60 * 1000 // 10d - matches the refresh token

// ====== JSON.parse that returns a fallback instead of throwing a 500 on bad input
const safeJsonParse = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

module.exports = {
  generateOTP,
  generateAccToken,
  generateRefreshToken,
  verifyToken,
  getCookieOptions,
  ACCESS_COOKIE_AGE,
  REFRESH_COOKIE_AGE,
  safeJsonParse,
};
