const leaseSchema = require("../models/leaseSchema")
const rentInvoiceSchema = require("../models/rentInvoiceSchema")
const rentalApplicationSchema = require("../models/rentalApplicationSchema")
const propertySchema = require("../models/propertySchema")
const { quoteLongTerm } = require("../sevices/pricingEngine")

// ====== Quote a lease without creating one
const getLeaseQuote = async(req,res)=>{
    try {
        const{propertyId,startDate,termMonths} = req.query

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!startDate) return res.status(400).send({message : 'Start date is required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        if(!property.rentalTypes?.includes('long')) return res.status(400).send({message : 'This property is not offered for long-term rent'})
        if(!property.longTermRent) return res.status(400).send({message : 'This property has no long-term rent'})

        const start = new Date(startDate)
        if(isNaN(start)) return res.status(400).send({message : 'Invalid start date'})

        const months = Number(termMonths) || property.minTermMonths || 12
        if(months < (property.minTermMonths || 12)) return res.status(400).send({message : `Minimum term is ${property.minTermMonths || 12} months`})

        const quote = quoteLongTerm(property, start, months)

        // =========== success ==========
        res.status(200).send({message : 'success',quote})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Landlord drafts a lease, normally from an approved application
const createLease = async(req,res)=>{
    try {
        const{propertyId,tenantId,applicationId,startDate,termMonths,monthlyRent,securityDeposit,rentDueDay,noticePeriodDays,lateFeeAmount,gracePeriodDays} = req.body

        if(!propertyId) return res.status(400).send({message : 'Property id is required'})
        if(!tenantId) return res.status(400).send({message : 'Tenant id is required'})
        if(!startDate) return res.status(400).send({message : 'Start date is required'})

        const property = await propertySchema.findById(propertyId)
        if(!property) return res.status(404).send({message : 'Property not found'})

        // ========= only the owner can lease it out =========
        if(property.host.toString() !== req.user._id && req.user.role !== 'admin') return res.status(403).send({message : 'Unauthorized'})
        if(!property.rentalTypes?.includes('long')) return res.status(400).send({message : 'This property is not offered for long-term rent'})

        const start = new Date(startDate)
        if(isNaN(start)) return res.status(400).send({message : 'Invalid start date'})

        const months = Number(termMonths) || property.minTermMonths || 12
        const rent = Number(monthlyRent) || property.longTermRent
        if(!rent) return res.status(400).send({message : 'Monthly rent is required'})

        const endDate = new Date(start)
        endDate.setMonth(endDate.getMonth() + months)

        // ========= a property cannot carry two live tenancies over the same dates =========
        const overlapping = await leaseSchema.findOne({
            property : propertyId,
            status : {$in : ['pending_signature','active','notice_given']},
            startDate : {$lt : endDate},
            endDate : {$gt : start}
        })
        if(overlapping) return res.status(400).send({message : 'This property already has a lease covering those dates'})

        const lease = await leaseSchema.create({
            property : propertyId,
            landlord : property.host,
            tenants : [tenantId],
            application : applicationId,
            startDate : start,
            endDate,
            termMonths : months,
            monthlyRent : rent,
            securityDeposit : securityDeposit !== undefined ? securityDeposit : (property.securityDeposit || 0),
            rentDueDay : rentDueDay || 1,
            noticePeriodDays : noticePeriodDays || 30,
            lateFeeAmount : lateFeeAmount || 0,
            gracePeriodDays : gracePeriodDays !== undefined ? gracePeriodDays : 5,
            utilitiesIncluded : !!property.utilitiesIncluded,
            status : 'pending_signature',
        })

        // ========= successfull =========
        res.status(201).send({message : 'Lease drafted.',lease})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Each party signs. The last signature activates the tenancy and builds the ledger.
const signLease = async(req,res)=>{
    try {
        const{id} = req.params

        const lease = await leaseSchema.findById(id)
        if(!lease) return res.status(404).send({message : 'Lease not found'})

        const isLandlord = lease.landlord.toString() === req.user._id
        const isTenant = lease.tenants.some(tenant => tenant.toString() === req.user._id)
        if(!isLandlord && !isTenant) return res.status(403).send({message : 'Unauthorized'})

        if(lease.status !== 'pending_signature') return res.status(400).send({message : 'This lease is not awaiting signature'})

        const alreadySigned = lease.signatures.some(signature => signature.user.toString() === req.user._id)
        if(alreadySigned) return res.status(400).send({message : 'You have already signed this lease'})

        lease.signatures.push({
            user : req.user._id,
            role : isLandlord ? 'landlord' : 'tenant',
            signedAt : new Date(),
            ip : req.ip,
        })

        // ========= everyone signed? then the tenancy starts =========
        const requiredSignatures = lease.tenants.length + 1
        if(lease.signatures.length >= requiredSignatures){
            lease.status = 'active'
            lease.depositStatus = 'held'

            // ====== Build the rent ledger up front so both sides can see what is owed
            const invoices = []
            for(let index = 0; index < lease.termMonths; index++){
                const periodStart = new Date(lease.startDate)
                periodStart.setMonth(periodStart.getMonth() + index)

                const periodEnd = new Date(periodStart)
                periodEnd.setMonth(periodEnd.getMonth() + 1)

                const dueDate = new Date(periodStart)
                dueDate.setDate(lease.rentDueDay)

                invoices.push({
                    lease : lease._id,
                    tenant : lease.tenants[0],
                    periodStart,
                    periodEnd,
                    dueDate,
                    amount : lease.monthlyRent,
                    status : index === 0 ? 'due' : 'upcoming',
                })
            }
            await rentInvoiceSchema.insertMany(invoices)
        }

        await lease.save()

        // ========= successfull =========
        res.status(200).send({message : lease.status === 'active' ? 'Lease signed and active.' : 'Signature recorded.',lease})

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

// ====== Either side gives notice, respecting the agreed notice period
const giveNotice = async(req,res)=>{
    try {
        const{id} = req.params

        const lease = await leaseSchema.findById(id)
        if(!lease) return res.status(404).send({message : 'Lease not found'})

        const isLandlord = lease.landlord.toString() === req.user._id
        const isTenant = lease.tenants.some(tenant => tenant.toString() === req.user._id)
        if(!isLandlord && !isTenant) return res.status(403).send({message : 'Unauthorized'})

        if(lease.status !== 'active') return res.status(400).send({message : 'Only an active lease can be given notice'})

        const earliestEnd = new Date()
        earliestEnd.setDate(earliestEnd.getDate() + lease.noticePeriodDays)

        lease.status = 'notice_given'
        lease.noticeGivenAt = new Date()
        await lease.save()

        // ========= successfull =========
        res.status(200).send({
            message : `Notice recorded. The tenancy can end no earlier than ${earliestEnd.toDateString()}.`,
            lease,
            earliestEndDate : earliestEnd,
        })

    }
    catch (error) {
      console.log(error)
      res.status(500).send({message : 'Internal server error'})
    }
}

const getMyLeases = async(req,res)=>{
    try {
        const leases = await leaseSchema.find({
            $or : [{landlord : req.user._id},{tenants : req.user._id}]
        })
        .populate('property','title thumbnail city country')
        .populate('landlord','fullName profileImg email')
        .populate('tenants','fullName profileImg email')
        .sort({createdAt : -1})

        // =========== success ==========
        res.status(200).send({message : 'success',leases})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

// ====== The tenancy ledger - every charge and payment for one lease
const getLeaseLedger = async(req,res)=>{
    try {
        const{id} = req.params

        const lease = await leaseSchema.findById(id)
        if(!lease) return res.status(404).send({message : 'Lease not found'})

        const isLandlord = lease.landlord.toString() === req.user._id
        const isTenant = lease.tenants.some(tenant => tenant.toString() === req.user._id)
        if(!isLandlord && !isTenant) return res.status(403).send({message : 'Unauthorized'})

        const invoices = await rentInvoiceSchema.find({lease : id}).sort({dueDate : 1})

        // =========== success ==========
        res.status(200).send({message : 'success',lease,invoices})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {getLeaseQuote,createLease,signLease,giveNotice,getMyLeases,getLeaseLedger}
