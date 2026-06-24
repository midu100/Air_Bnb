const express = require('express')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const dbConfig = require('./dbConfig')
const route = require('./routes')
const { generateOTP } = require('./sevices/helpers')
const claudinaryConfig = require('./sevices/claudinaryConfig')
const app = express()
const port = 8000



app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
dbConfig()
claudinaryConfig()
app.use(route)



app.listen(port,()=>{
    console.log('server is running...')
})