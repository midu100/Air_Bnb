const roleCheckMiddleware = (...roles)=>{
    const flatRoles = roles.flat();
    return (req,res,next)=>{
        try {
            if(flatRoles.includes(req.user.role)){
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