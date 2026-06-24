const jwt = require("jsonwebtoken");
const { verifyToken } = require("../sevices/helpers");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies
    if(!token['X_AS-TOKEN']) return res.status(401).send({message : 'Missing Token'})
    
    const decoded = verifyToken(token['X_AS-TOKEN'])
    if(!decoded) return res.status(401).send({message : 'Invalid request'})
    
    req.user = decoded
    next()
  } 
  catch (err) {
    console.log(err)
  }
};

module.exports = authMiddleware
