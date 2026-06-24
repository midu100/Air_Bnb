const amenitySchema = require("../models/amenitySchema")

const createAmenity = async(req,res)=>{
    try {
        const{name,icon} = req.body

        if(!name) return res.status(400).send({message : 'Amenity name is required'})

        const existAmenity = await amenitySchema.findOne({name})
        if(existAmenity) return res.status(400).send({message : 'Amenity already exist'})

        const amenity = new amenitySchema({
            name,
            icon
        })
        await amenity.save()

        // ========= successfull =========
        res.status(201).send({message : 'Amenity created.',amenity})

    } 
    catch (error) {
      console.log(error)    
    }
}

const getAllAmenity = async(req,res)=>{
    try {
        const amenities = await amenitySchema.find({})

        // =========== success ==========
        res.status(200).send({message : 'success',amenities})
    } 
    catch (error) {
       console.log(error)  
    }
}

const updateAmenity = async(req,res)=>{
    try {
        const{id} = req.params
        const{name,icon} = req.body

        const amenity = await amenitySchema.findById(id)
        if(!amenity) return res.status(404).send({message : 'Amenity not found'})

        const updatedAmenity = await amenitySchema.findByIdAndUpdate(id,{name,icon},{new : true})

        // ========= successfull =========
        res.status(200).send({message : 'Amenity updated.',amenity : updatedAmenity})

    } 
    catch (error) {
      console.log(error)    
    }
}

const deleteAmenity = async(req,res)=>{
    try {
        const{id} = req.params

        const amenity = await amenitySchema.findById(id)
        if(!amenity) return res.status(404).send({message : 'Amenity not found'})

        await amenitySchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Amenity deleted.'})

    } 
    catch (error) {
      console.log(error)    
    }
}

module.exports = {createAmenity,getAllAmenity,updateAmenity,deleteAmenity}
