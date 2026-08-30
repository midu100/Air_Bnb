const rentalApplicationSchema = require("../models/rentalApplicationSchema")
const propertySchema = require("../models/propertySchema")

// ====== Applicant submits for one listing
const createApplication = async(req,res)=>{
    try {
        const{propertyId,employmentStatus,employer,jobTitle,monthlyIncome,currentAddress,rentalHistory,coApplicants,guarantor,desiredMoveIn,desiredTermMonths,pets,message,screeningConsent} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!monthlyIncome) return res.status(400).send({message : 'Monthly income is required'})
        if(!desiredMoveIn) return res.status(400).send({message : 'Desired move-in date is required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})
        if(!property.rentalTypes?.includes('long')) return res.status(400).send({message : 'This property is not offered for long-term rent'})

        // ========= one live application per applicant per property =========
        const existing = await rentalApplicationSchema.findOne({
            property : propertyId,
            applicant : req.user._id,
            status : {$in : ['submitted','screening','approved']}
        })
        if(existing) return res.status(400).send({message : 'You already have an application in progress for this property'})

        const application = await rentalApplicationSchema.create({
            property : propertyId,
            applicant : req.user._id,
            landlord : property.host,
            employmentStatus,
            employer,
            jobTitle,
            monthlyIncome,
            currentAddress,
            rentalHistory : Array.isArray(rentalHistory) ? rentalHistory : [],
            coApplicants : Array.isArray(coApplicants) ? coApplicants : [],
            guarantor,
            desiredMoveIn,
            desiredTermMonths,
            pets,
            message,
            // Screening cannot run without a recorded, timestamped consent
            screeningConsent : screeningConsent === true || screeningConsent === 'true'
                ? { given : true, givenAt : new Date(), ip : req.ip }
                : { given : false },
        })

        // ========= successfull =========
        res.status(201).send({message : 'Application submitted.',application})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getMyApplications = async(req,res)=>{
    try {
        const applications = await rentalApplicationSchema.find({applicant : req.user._id})
        .populate('property','title thumbnail city country longTermRent')
        .populate('landlord','fullName profileImg')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',applications})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Landlord reviews what has come in
const getLandlordApplications = async(req,res)=>{
    try {
        const applications = await rentalApplicationSchema.find({landlord : req.user._id})
        .populate('property','title thumbnail city country longTermRent')
        .populate('applicant','fullName profileImg email phone')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',applications})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Approve or decline
const decideApplication = async(req,res)=>{
    try {
        const{id} = req.params
        const{decision,declineReason} = req.body

        if(!['approved','declined'].includes(decision)) return res.status(400).send({message : 'Decision must be approved or declined'})

        const application = await rentalApplicationSchema.findById(id)
        if(!application) return res.status(404).send({message : 'Application not found'})

        if(application.landlord.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})
        if(!['submitted','screening'].includes(application.status)) return res.status(400).send({message : 'This application has already been decided'})

        application.status = decision
        if(decision === 'declined') application.declineReason = declineReason
        await application.save()

        // ========= successfull =========
        res.status(200).send({message : `Application ${decision}.`,application})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Applicant pulls out
const withdrawApplication = async(req,res)=>{
    try {
        const{id} = req.params

        const application = await rentalApplicationSchema.findById(id)
        if(!application) return res.status(404).send({message : 'Application not found'})

        if(application.applicant.toString() !== req.user._id) return res.status(403).send({message : 'Unauthorized'})

        application.status = 'withdrawn'
        await application.save()

        // ========= successfull =========
        res.status(200).send({message : 'Application withdrawn.',application})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {createApplication,getMyApplications,getLandlordApplications,decideApplication,withdrawApplication}
