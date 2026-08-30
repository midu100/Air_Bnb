const { SUPPORTED, SYMBOLS, getRates, convert } = require("../sevices/currencyService")

// ====== Rates the client caches to render prices in the viewer's currency
const getExchangeRates = async(req,res)=>{
    try {
        const{ rates, live } = await getRates()

        // =========== success ==========
        res.status(200).send({message : 'success',base : 'USD',supported : SUPPORTED,symbols : SYMBOLS,rates,live})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

const convertAmount = async(req,res)=>{
    try {
        const{amount,from = 'USD',to = 'USD'} = req.query

        const value = Number(amount)
        if(!Number.isFinite(value)) return res.status(400).send({message : 'A numeric amount is required'})
        if(!SUPPORTED.includes(from) || !SUPPORTED.includes(to)) return res.status(400).send({message : 'Unsupported currency'})

        const{ rates } = await getRates()

        // =========== success ==========
        res.status(200).send({message : 'success',amount : value,from,to,converted : convert(value,from,to,rates)})
    }
    catch (error) {
       console.log(error)
       res.status(500).send({message : 'Internal server error'})
    }
}

module.exports = {getExchangeRates,convertAmount}
