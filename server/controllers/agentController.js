const agentRunSchema = require("../models/agentRunSchema")
const { runAgent, executeProposal, declineProposal } = require("../sevices/agentService")
const { isConfigured } = require("../sevices/llmClient")

// ====== Is the assistant usable at all?
// Answered without calling the provider, so the panel can render an honest
// "not configured" state instead of a failure.
const getStatus = async(req,res)=>{
    try {
        const configured = isConfigured()

        // =========== success ==========
        res.status(200).send({
            message : 'success',
            status : {
                configured,
                provider : process.env.AI_PROVIDER || 'gemini',
                reason : configured ? null : 'No API key is set for the AI provider',
            },
        })
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const ask = async(req,res)=>{
    try {
        const{question,history} = req.body

        if(!question || typeof question !== 'string' || !question.trim()) return res.status(400).send({message : 'Ask a question'})
        if(question.length > 2000) return res.status(400).send({message : 'That question is too long'})

        const result = await runAgent({
            hostId : req.user._id,
            question : question.trim(),
            history : Array.isArray(history) ? history : [],
        })

        // =========== success ==========
        res.status(200).send({message : 'success',...result})
    }
    catch (error) {
       console.log(error)
       if(error.notConfigured) return res.status(503).send({message : error.message})
       res.status(500).send({message : 'The assistant could not finish that. Please try again.'})
    }
}

// ====== Run one change the host confirmed
const confirm = async(req,res)=>{
    try {
        const{runId,index} = req.body

        if(!runId) return res.status(400).send({message : 'runId is required'})
        const position = Number(index)
        if(!Number.isInteger(position) || position < 0) return res.status(400).send({message : 'index must be a whole number'})

        const result = await executeProposal({hostId : req.user._id,runId,index : position})

        // ========= successfull =========
        res.status(200).send({message : `${result.summary} — done.`,...result})
    }
    catch (error) {
      console.log(error)
      res.status(error.status || 500).send({message : error.message || 'Internal server error'})
    }
}

const decline = async(req,res)=>{
    try {
        const{runId,index} = req.body

        if(!runId) return res.status(400).send({message : 'runId is required'})
        const position = Number(index)
        if(!Number.isInteger(position) || position < 0) return res.status(400).send({message : 'index must be a whole number'})

        const result = await declineProposal({hostId : req.user._id,runId,index : position})

        // ========= successfull =========
        res.status(200).send({message : 'Change declined.',...result})
    }
    catch (error) {
      console.log(error)
      res.status(error.status || 500).send({message : error.message || 'Internal server error'})
    }
}

// ====== What the assistant has done, so nothing it changed is invisible
const getHistory = async(req,res)=>{
    try {
        const runs = await agentRunSchema.find({host : req.user._id}).sort({createdAt : -1}).limit(25)

        // =========== success ==========
        res.status(200).send({message : 'success',runs})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {getStatus,ask,confirm,decline,getHistory}
