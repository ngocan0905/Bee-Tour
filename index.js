const express = require('express')
require('dotenv').config()
const app = express()
const dbConnect = require('./configs/dbConnect')
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json())
const tourRouter = require('./router/tourRoute')
const {PORT} = process.env
dbConnect()

app.use('/api/v1/tour', tourRouter)
app.listen(PORT,()=> console.log(`server is running at http://localhost:${PORT}`) )