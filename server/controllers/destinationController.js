const destinationSchema = require("../models/destinationSchema")
const propertySchema = require("../models/propertySchema")
const uploadToClaudinary = require("../sevices/claudinaryServices")

// ====== How many homes each city actually has
// One grouped query rather than a count per destination, so adding cities to
// the home page never adds queries to the request that renders it.
const countByCity = async()=>{
    const rows = await propertySchema.aggregate([
        {$match : {status : 'published'}},
        {$group : {_id : '$city',total : {$sum : 1}}},
    ])

    const counts = new Map()
    rows.forEach((row)=>{
        if(row._id) counts.set(String(row._id).toLowerCase(),row.total)
    })
    return counts
}

const withCounts = async(destinations)=>{
    const counts = await countByCity()
    return destinations.map((item)=>({
        ...item.toObject(),
        propertyCount : counts.get(String(item.city).toLowerCase()) || 0,
    }))
}

const createDestination = async(req,res)=>{
    try {
        const{city,country,flag,slug,order,isActive} = req.body
        const image = req.file

        if(!city) return res.status(400).send({message : 'Destination city is required'})
        if(!country) return res.status(400).send({message : 'Destination country is required'})
        if(!slug) return res.status(400).send({message : 'Destination slug is required'})
        if(!image) return res.status(400).send({message : 'Destination image is required'})

        const existDestination = await destinationSchema.findOne({slug : slug.toLowerCase()})
        if(existDestination) return res.status(400).send({message : 'Destination slug already exist'})

        //========= upload image to claudinary =========
        const imgRes = await uploadToClaudinary(image,'destination')

        const destination = new destinationSchema({
            city,
            country,
            flag,
            slug,
            image : imgRes.secure_url,
            order : Number(order) || 0,
            isActive : isActive === 'false' ? false : true,
        })
        await destination.save()

        // ========= successfull =========
        res.status(201).send({message : 'Destination created.',destination})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// What the home page asks for - live destinations only, in the order an editor set
const getAllDestination = async(req,res)=>{
    try {
        const destinations = await destinationSchema.find({isActive : true}).sort({order : 1,createdAt : 1})

        // =========== success ==========
        res.status(200).send({message : 'success',destinations : await withCounts(destinations)})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// What the dashboard asks for - the hidden ones too, or they could never be
// switched back on
const getAdminDestination = async(req,res)=>{
    try {
        const destinations = await destinationSchema.find({}).sort({order : 1,createdAt : 1})

        // =========== success ==========
        res.status(200).send({message : 'success',destinations : await withCounts(destinations)})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const updateDestination = async(req,res)=>{
    try {
        const{id} = req.params
        const{city,country,flag,slug,order,isActive} = req.body
        const image = req.file

        const destination = await destinationSchema.findById(id)
        if(!destination) return res.status(404).send({message : 'Destination not found'})

        if(slug && slug.toLowerCase() !== destination.slug){
            const existDestination = await destinationSchema.findOne({slug : slug.toLowerCase()})
            if(existDestination) return res.status(400).send({message : 'Destination slug already exist'})
            destination.slug = slug
        }

        if(city) destination.city = city
        if(country) destination.country = country
        if(typeof flag === 'string') destination.flag = flag
        if(order !== undefined) destination.order = Number(order) || 0
        if(isActive !== undefined) destination.isActive = isActive === 'false' ? false : true

        // Only pay for an upload when a new picture actually arrived
        if(image){
            const imgRes = await uploadToClaudinary(image,'destination')
            destination.image = imgRes.secure_url
        }

        await destination.save()

        // ========= successfull =========
        res.status(200).send({message : 'Destination updated.',destination})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const deleteDestination = async(req,res)=>{
    try {
        const{id} = req.params

        const destination = await destinationSchema.findByIdAndDelete(id)
        if(!destination) return res.status(404).send({message : 'Destination not found'})

        // ========= successfull =========
        res.status(200).send({message : 'Destination deleted.'})
    } 
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createDestination,getAllDestination,getAdminDestination,updateDestination,deleteDestination}
