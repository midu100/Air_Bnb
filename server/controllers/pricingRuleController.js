const pricingRuleSchema = require("../models/pricingRuleSchema")
const propertySchema = require("../models/propertySchema")

// ====== Owner check shared by every write here
const loadOwnedProperty = async(propertyId,user)=>{
    const property = await propertySchema.findById(propertyId)
    if(!property) return { error : 'Property not found', status : 404 }
    if(property.host.toString() !== user._id && user.role !== 'admin') return { error : 'Unauthorized', status : 403 }
    return { property }
}

const createRule = async(req,res)=>{
    try {
        const{propertyId,name,startDate,endDate,daysOfWeek,nightlyRate,monthlyRate,priority,minStayNights} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!name) return res.status(400).send({message : 'Rule name is required'})
        if(!nightlyRate && !monthlyRate) return res.status(400).send({message : 'A nightly or monthly rate is required'})

        const{error,status} = await loadOwnedProperty(propertyId,req.user)
        if(error) return res.status(status).send({message : error})

        const rule = await pricingRuleSchema.create({
            property : propertyId,
            name,
            startDate : startDate || undefined,
            endDate : endDate || undefined,
            daysOfWeek : Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [],
            nightlyRate,
            monthlyRate,
            priority : priority || 0,
            minStayNights,
        })

        // ========= successfull =========
        res.status(201).send({message : 'Pricing rule created.',rule})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getPropertyRules = async(req,res)=>{
    try {
        const{propertyId} = req.params

        const rules = await pricingRuleSchema.find({property : propertyId}).sort({priority : -1,createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',rules})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const updateRule = async(req,res)=>{
    try {
        const{id} = req.params

        const rule = await pricingRuleSchema.findById(id)
        if(!rule) return res.status(404).send({message : 'Rule not found'})

        const{error,status} = await loadOwnedProperty(rule.property,req.user)
        if(error) return res.status(status).send({message : error})

        const fields = ['name','startDate','endDate','daysOfWeek','nightlyRate','monthlyRate','priority','minStayNights','isActive']
        const updateData = {}
        for(const field of fields){
            if(req.body[field] !== undefined) updateData[field] = req.body[field]
        }

        const updatedRule = await pricingRuleSchema.findByIdAndUpdate(id,updateData,{new : true,runValidators : true})

        // ========= successfull =========
        res.status(200).send({message : 'Pricing rule updated.',rule : updatedRule})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const deleteRule = async(req,res)=>{
    try {
        const{id} = req.params

        const rule = await pricingRuleSchema.findById(id)
        if(!rule) return res.status(404).send({message : 'Rule not found'})

        const{error,status} = await loadOwnedProperty(rule.property,req.user)
        if(error) return res.status(status).send({message : error})

        await pricingRuleSchema.findByIdAndDelete(id)

        // ========= successfull =========
        res.status(200).send({message : 'Pricing rule deleted.'})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createRule,getPropertyRules,updateRule,deleteRule}
