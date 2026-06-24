const propertySchema = require("../models/propertySchema")
const uploadToClaudinary = require("../sevices/claudinaryServices")

const createProperty = async(req,res)=>{
    try {
        const{title,description,propertyType,pricePerNight,cleaningFee,serviceFee,maxGuests,bedrooms,beds,bathrooms,amenities,address,city,state,country,zipCode,coordinates,houseRules,category} = req.body
        const thumbnail = req.files?.thumbnail?.[0]
        const images = req.files?.images

        if(!title) return res.status(400).send({message : 'Title is required'})
        if(!description) return res.status(400).send({message : 'Description is required'})
        if(!propertyType) return res.status(400).send({message : 'Property type is required'})
        if(!pricePerNight) return res.status(400).send({message : 'Price per night is required'})
        if(!maxGuests) return res.status(400).send({message : 'Max guests is required'})
        if(!address) return res.status(400).send({message : 'Address is required'})
        if(!city) return res.status(400).send({message : 'City is required'})
        if(!country) return res.status(400).send({message : 'Country is required'})
        if(!category) return res.status(400).send({message : 'Category is required'})
        if(!thumbnail) return res.status(400).send({message : 'Thumbnail is required'})

        //========= upload thumbnail to claudinary =========
        const thumbnailRes = await uploadToClaudinary(thumbnail,'property')
        let thumbnailUrl = thumbnailRes.secure_url

        //========= upload images to claudinary =========
        let imageUrls = []
        if(images && images.length > 0){
            for(const img of images){
                const imgRes = await uploadToClaudinary(img,'property')
                imageUrls.push(imgRes.secure_url)
            }
        }

        const property = new propertySchema({
            host : req.user._id,
            category,
            title,
            description,
            propertyType,
            thumbnail : thumbnailUrl,
            images : imageUrls,
            pricePerNight,
            cleaningFee,
            serviceFee,
            maxGuests,
            bedrooms,
            beds,
            bathrooms,
            amenities : amenities ? JSON.parse(amenities) : [],
            address,
            city,
            state,
            country,
            zipCode,
            coordinates : coordinates ? JSON.parse(coordinates) : {},
            houseRules : houseRules ? JSON.parse(houseRules) : [],
        })
        await property.save()

        // ========= successfull =========
        res.status(201).send({message : 'Property created.',property})

    } 
    catch (error) {
      console.log(error)    
    }
}

const getProperties = async(req,res)=>{
    try {
        const{page = 1,limit = 10} = req.query

        const properties = await propertySchema.find({status : 'published'})
        .populate('host','fullName profileImg')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})
        .skip((page - 1) * limit)
        .limit(Number(limit))

        const total = await propertySchema.countDocuments({status : 'published'})

        // =========== success ==========
        res.status(200).send({message : 'success',properties,total,page : Number(page),limit : Number(limit)})
    } 
    catch (error) {
       console.log(error)  
    }
}

const getPropertyById = async(req,res)=>{
    try {
        const{id} = req.params

        const property = await propertySchema.findById(id)
        .populate('host','fullName profileImg phone')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')

        if(!property) return res.status(404).send({message : 'Property not found'})

        // =========== success ==========
        res.status(200).send({message : 'success',property})
    } 
    catch (error) {
       console.log(error)  
    }
}

const updateProperty = async(req,res)=>{
    try {
        const{id} = req.params
        const updateData = req.body
        const thumbnail = req.files?.thumbnail?.[0]
        const images = req.files?.images

        const property = await propertySchema.findById(id)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= check owner =========
        if(property.host.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        //========= upload new thumbnail if provided =========
        if(thumbnail){
            const thumbnailRes = await uploadToClaudinary(thumbnail,'property')
            updateData.thumbnail = thumbnailRes.secure_url
        }

        //========= upload new images if provided =========
        if(images && images.length > 0){
            let imageUrls = []
            for(const img of images){
                const imgRes = await uploadToClaudinary(img,'property')
                imageUrls.push(imgRes.secure_url)
            }
            updateData.images = imageUrls
        }

        // ========= parse json fields =========
        if(updateData.amenities) updateData.amenities = JSON.parse(updateData.amenities)
        if(updateData.coordinates) updateData.coordinates = JSON.parse(updateData.coordinates)
        if(updateData.houseRules) updateData.houseRules = JSON.parse(updateData.houseRules)

        const updatedProperty = await propertySchema.findByIdAndUpdate(id,updateData,{new : true})

        // ========= successfull =========
        res.status(200).send({message : 'Property updated.',property : updatedProperty})

    } 
    catch (error) {
      console.log(error)    
    }
}

const deleteProperty = async(req,res)=>{
    try {
        const{id} = req.params

        const property = await propertySchema.findById(id)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= check owner =========
        if(property.host.toString() !== req.user._id) return res.status(401).send({message : 'Unauthorized'})

        await propertySchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Property deleted.'})

    } 
    catch (error) {
      console.log(error)    
    }
}

const getHostProperties = async(req,res)=>{
    try {
        const properties = await propertySchema.find({host : req.user._id})
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',properties})
    } 
    catch (error) {
       console.log(error)  
    }
}

const searchProperties = async(req,res)=>{
    try {
        const{city,country,propertyType,minPrice,maxPrice,maxGuests,bedrooms,page = 1,limit = 10} = req.query

        let filter = {status : 'published'}

        if(city) filter.city = {$regex : city,$options : 'i'}
        if(country) filter.country = {$regex : country,$options : 'i'}
        if(propertyType) filter.propertyType = propertyType
        if(minPrice || maxPrice){
            filter.pricePerNight = {}
            if(minPrice) filter.pricePerNight.$gte = Number(minPrice)
            if(maxPrice) filter.pricePerNight.$lte = Number(maxPrice)
        }
        if(maxGuests) filter.maxGuests = {$gte : Number(maxGuests)}
        if(bedrooms) filter.bedrooms = {$gte : Number(bedrooms)}

        const properties = await propertySchema.find(filter)
        .populate('host','fullName profileImg')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})
        .skip((page - 1) * limit)
        .limit(Number(limit))

        const total = await propertySchema.countDocuments(filter)

        // =========== success ==========
        res.status(200).send({message : 'success',properties,total,page : Number(page),limit : Number(limit)})
    } 
    catch (error) {
       console.log(error)  
    }
}

const getFeaturedProperties = async(req,res)=>{
    try {
        const properties = await propertySchema.find({isFeatured : true,status : 'published'})
        .populate('host','fullName profileImg')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',properties})
    } 
    catch (error) {
       console.log(error)  
    }
}

module.exports = {createProperty,getProperties,getPropertyById,updateProperty,deleteProperty,getHostProperties,searchProperties,getFeaturedProperties}
