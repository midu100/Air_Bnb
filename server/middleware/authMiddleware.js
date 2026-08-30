const { verifyToken } = require("../sevices/helpers");

const authMiddleware = async (req, res, next) => {
  try {
    // ========= cookie first, Authorization header as fallback =========
    const cookieToken = req.cookies?.['X_AS-TOKEN']
    const headerToken = req.headers?.authorization?.replace(/^Bearer\s+/i, '')
    const token = cookieToken || headerToken

    if (!token) return res.status(401).send({ message: 'Missing Token' })

    const decoded = verifyToken(token)
    if (!decoded) return res.status(401).send({ message: 'Invalid or expired token' })

    req.user = decoded
    next()
  }
  catch (error) {
    // ========= always answer, an empty catch left the request hanging =========
    console.log(error)
    return res.status(500).send({ message: 'Internal server error' })
  }
};

module.exports = authMiddleware
