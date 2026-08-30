const propertySchema = require("../models/propertySchema")
const uploadToClaudinary = require("../sevices/claudinaryServices")
const { safeJsonParse } = require("../sevices/helpers")

// Fields a host is allowed to change. host, averageRating and totalReviews are absent on
// purpose - the whole req.body used to be passed to findByIdAndUpdate, so a host could
// reassign ownership or fake their own rating.
const UPDATABLE_FIELDS = [
    'title','description','propertyType','pricePerNight','cleaningFee','serviceFee',
    'maxGuests','bedrooms','beds','bathrooms','address','city','state','country',
    'zipCode','category','status',
    // ====== policy, tax and currency
    'cancellationPolicy','taxRatePercent','currency',
    // ====== horizon fields
    'monthlyRate','longTermRent','minStayNights','maxStayNights','minStayMonths',
    'maxStayMonths','minTermMonths','securityDeposit','utilitiesIncluded','utilityCap',
    'furnished','availableFrom'
]

// Keeps limit=999999 from pulling the whole collection in one request
const MAX_PAGE_LIMIT = 100

const parsePaging = (query) => {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Number(query.limit) || 10))
    return { page, limit }
}

const createProperty = async(req,res)=>{
    try {
        const{title,description,propertyType,pricePerNight,cleaningFee,serviceFee,maxGuests,bedrooms,beds,bathrooms,amenities,address,city,state,country,zipCode,coordinates,houseRules,category,status,isFeatured,rentalTypes} = req.body
        const rest = req.body

        // A listing must declare at least one horizon, defaulting to short-term
        const parsedRentalTypes = safeJsonParse(rentalTypes,null) || (Array.isArray(rentalTypes) ? rentalTypes : ['short'])
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
            amenities : safeJsonParse(amenities,[]),
            address,
            city,
            state,
            country,
            zipCode,
            coordinates : safeJsonParse(coordinates,{}),
            houseRules : safeJsonParse(houseRules,[]),
            status : status || 'draft',
            // ====== horizon configuration
            rentalTypes : parsedRentalTypes,
            monthlyRate : rest.monthlyRate,
            longTermRent : rest.longTermRent,
            minStayNights : rest.minStayNights,
            maxStayNights : rest.maxStayNights,
            minStayMonths : rest.minStayMonths,
            maxStayMonths : rest.maxStayMonths,
            minTermMonths : rest.minTermMonths,
            securityDeposit : rest.securityDeposit,
            utilitiesIncluded : rest.utilitiesIncluded === 'true' || rest.utilitiesIncluded === true,
            utilityCap : rest.utilityCap,
            furnished : rest.furnished,
            availableFrom : rest.availableFrom,
            discounts : safeJsonParse(rest.discounts,{weekly : 0,monthly : 0}),
            cancellationPolicy : rest.cancellationPolicy || 'moderate',
            taxRatePercent : rest.taxRatePercent,
            currency : rest.currency || 'USD',
            workspace : safeJsonParse(rest.workspace,{}),
            // Featuring a listing is a platform decision, never the host's own call
            isFeatured : req.user.role === 'admin' && (isFeatured === 'true' || isFeatured === true),
        })
        await property.save()

        // ========= successfull =========
        res.status(201).send({message : 'Property created.',property})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getProperties = async(req,res)=>{
    try {
        const{page,limit} = parsePaging(req.query)

        const properties = await propertySchema.find({status : 'published'})
        .populate('host','fullName profileImg')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})
        .skip((page - 1) * limit)
        .limit(limit)

        const total = await propertySchema.countDocuments({status : 'published'})

        // =========== success ==========
        res.status(200).send({message : 'success',properties,total,page,limit})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
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
       res.status(500).send({message : 'Internal server error'})
    }
}

const updateProperty = async(req,res)=>{
    try {
        const{id} = req.params
        const thumbnail = req.files?.thumbnail?.[0]
        const images = req.files?.images

        const property = await propertySchema.findById(id)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= check owner =========
        const isOwner = property.host.toString() === req.user._id
        const isAdmin = req.user.role === 'admin'
        if(!isOwner && !isAdmin) return res.status(403).send({message : 'Unauthorized'})

        // ========= copy only whitelisted fields =========
        const updateData = {}
        for(const field of UPDATABLE_FIELDS){
            if(req.body[field] !== undefined) updateData[field] = req.body[field]
        }
        if(isAdmin && req.body.isFeatured !== undefined){
            updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true
        }

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
        if(req.body.amenities !== undefined) updateData.amenities = safeJsonParse(req.body.amenities,[])
        if(req.body.coordinates !== undefined) updateData.coordinates = safeJsonParse(req.body.coordinates,{})
        if(req.body.houseRules !== undefined) updateData.houseRules = safeJsonParse(req.body.houseRules,[])
        if(req.body.discounts !== undefined) updateData.discounts = safeJsonParse(req.body.discounts,{weekly : 0,monthly : 0})
        if(req.body.workspace !== undefined) updateData.workspace = safeJsonParse(req.body.workspace,{})
        if(req.body.rentalTypes !== undefined){
            updateData.rentalTypes = safeJsonParse(req.body.rentalTypes,null) || (Array.isArray(req.body.rentalTypes) ? req.body.rentalTypes : ['short'])
        }

        const updatedProperty = await propertySchema.findByIdAndUpdate(id,updateData,{new : true,runValidators : true})

        // ========= successfull =========
        res.status(200).send({message : 'Property updated.',property : updatedProperty})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const deleteProperty = async(req,res)=>{
    try {
        const{id} = req.params

        const property = await propertySchema.findById(id)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= check owner =========
        const isOwner = property.host.toString() === req.user._id
        const isAdmin = req.user.role === 'admin'
        if(!isOwner && !isAdmin) return res.status(403).send({message : 'Unauthorized'})

        await propertySchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Property deleted.'})

    } 
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
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
       res.status(500).send({message : 'Internal server error'})
    }
}

const searchProperties = async(req,res)=>{
    try {
        const{destination,city,country,propertyType,category,rentalType,furnished,minPrice,maxPrice,maxGuests,bedrooms} = req.query
        const{page,limit} = parsePaging(req.query)

        let filter = {status : 'published'}

        // ====== Horizon decides which price field a price filter applies to
        const priceFieldByType = { short : 'pricePerNight', mid : 'monthlyRate', long : 'longTermRent' }
        const priceField = priceFieldByType[rentalType] || 'pricePerNight'

        if(typeof rentalType === 'string' && priceFieldByType[rentalType]){
            filter.rentalTypes = rentalType
            // Only surface listings that actually carry a rate for that horizon
            filter[priceField] = {$gt : 0}
        }
        if(typeof furnished === 'string' && furnished) filter.furnished = furnished

        // String checks keep a { "$regex": ... } style payload out of the filter
        // One box that matches title, city or country - what the UI actually needs
        if(typeof destination === 'string' && destination){
            const safe = destination.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
            filter.$or = [
                {title : {$regex : safe,$options : 'i'}},
                {city : {$regex : safe,$options : 'i'}},
                {country : {$regex : safe,$options : 'i'}},
            ]
        }
        if(typeof city === 'string' && city) filter.city = {$regex : city,$options : 'i'}
        if(typeof country === 'string' && country) filter.country = {$regex : country,$options : 'i'}
        if(typeof propertyType === 'string' && propertyType) filter.propertyType = propertyType
        if(typeof category === 'string' && category) filter.category = category
        if(minPrice || maxPrice){
            const range = filter[priceField] && typeof filter[priceField] === 'object' ? filter[priceField] : {}
            if(minPrice) range.$gte = Number(minPrice)
            if(maxPrice) range.$lte = Number(maxPrice)
            filter[priceField] = range
        }
        if(maxGuests) filter.maxGuests = {$gte : Number(maxGuests)}
        if(bedrooms) filter.bedrooms = {$gte : Number(bedrooms)}

        const properties = await propertySchema.find(filter)
        .populate('host','fullName profileImg')
        .populate('category','name slug thumbnail')
        .populate('amenities','name icon')
        .sort({createdAt : -1})
        .skip((page - 1) * limit)
        .limit(limit)

        const total = await propertySchema.countDocuments(filter)

        // =========== success ==========
        res.status(200).send({message : 'success',properties,total,page,limit})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
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
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createProperty,getProperties,getPropertyById,updateProperty,deleteProperty,getHostProperties,searchProperties,getFeaturedProperties}
