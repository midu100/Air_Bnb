const wishlistSchema = require("../models/wishlistSchema")
const propertySchema = require("../models/propertySchema")

const addToWishlist = async(req,res)=>{
    try {
        const{propertyId} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})

        // ========= 1. property exists? =========
        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= 2. find or create wishlist =========
        let wishlist = await wishlistSchema.findOne({user : req.user._id})

        if(!wishlist){
            wishlist = new wishlistSchema({
                user : req.user._id,
                properties : [propertyId]
            })
            await wishlist.save()
            return res.status(201).send({message : 'Added to wishlist.',wishlist})
        }

        // ========= 3. already in wishlist? =========
        const alreadyExists = wishlist.properties.some(id => id.toString() === propertyId)
        if(alreadyExists) return res.status(400).send({message : 'Property already in wishlist'})

        // ========= 4. add to wishlist =========
        wishlist.properties.push(propertyId)
        await wishlist.save()

        // ========= successfull =========
        res.status(200).send({message : 'Added to wishlist.',wishlist})

    } 
    catch (error) {
      console.log(error)    
    }
}

const removeFromWishlist = async(req,res)=>{
    try {
        const{propertyId} = req.params

        // ========= 1. wishlist exists? =========
        const wishlist = await wishlistSchema.findOne({user : req.user._id})
        if(!wishlist) return res.status(404).send({message : 'Wishlist not found'})

        // ========= 2. property in wishlist? =========
        const propertyIndex = wishlist.properties.findIndex(id => id.toString() === propertyId)
        if(propertyIndex === -1) return res.status(404).send({message : 'Property not found in wishlist'})

        // ========= 3. remove from wishlist =========
        wishlist.properties.splice(propertyIndex,1)
        await wishlist.save()

        // ========= successfull =========
        res.status(200).send({message : 'Removed from wishlist.',wishlist})

    } 
    catch (error) {
      console.log(error)    
    }
}

const getMyWishlist = async(req,res)=>{
    try {
        const wishlist = await wishlistSchema.findOne({user : req.user._id})
        .populate('properties','title thumbnail city country pricePerNight averageRating')

        if(!wishlist) return res.status(200).send({message : 'success',properties : []})

        // =========== success ==========
        res.status(200).send({message : 'success',properties : wishlist.properties})
    } 
    catch (error) {
       console.log(error)  
    }
}

const clearWishlist = async(req,res)=>{
    try {
        const wishlist = await wishlistSchema.findOne({user : req.user._id})
        if(!wishlist) return res.status(404).send({message : 'Wishlist not found'})

        wishlist.properties = []
        await wishlist.save()

        // ========= successfull =========
        res.status(200).send({message : 'Wishlist cleared.'})

    } 
    catch (error) {
      console.log(error)    
    }
}

module.exports = {addToWishlist,removeFromWishlist,getMyWishlist,clearWishlist}
