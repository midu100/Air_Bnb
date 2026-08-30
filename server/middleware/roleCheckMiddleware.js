const roleCheckMiddleware = (...roles)=>{
    const flatRoles = roles.flat();
    return (req,res,next)=>{
        try {
            if(req.user && flatRoles.includes(req.user.role)){
                return next()
            }
            return res.status(403).send({message : 'Invalid role.'})
        } 
        catch (error) {
           // ========= always answer, an empty catch left the request hanging =========
           console.log(error)
           return res.status(500).send({message : 'Internal server error'})    
        }
    }
}

module.exports = roleCheckMiddleware
