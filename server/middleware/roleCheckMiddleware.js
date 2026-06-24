const roleCheckMiddleware = (...roles)=>{
    return (req,res,next)=>{
        try {
            if(roles.includes(req.user.role)){
                return next()
            }
            return res.status(401).send({message : 'Invalid role.'})
        } 
        catch (error) {
           console.log(error)    
        }
    }
}

module.exports = roleCheckMiddleware