const Tour = require('../models/tourModel')
const fs =require('fs')
exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}
exports.getTours = async(req,res)=>{
    try {
        // build  query
        // 1) filtering
        const queryObj = {...req.query}
        const excludedFieds = ['page','sort','limit','fields']
        excludedFieds.forEach(element=> delete queryObj[element])
        
        // 2) advanced fltering
        let queryStr = JSON.stringify(queryObj)
        queryStr =  queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
        let query =  Tour.find(JSON.parse(queryStr)) 
        // 3) sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(" ")
            query = query.sort(sortBy)
        }else{
            query = query.sort('-createdAt')
        }
        // 4) field limiting
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);

        }else{
            query = query.select('-__v')
        }
        // 5) pagination
        const page = req.query.page * 1|| 1;
        const limit = req.query.limit*1 || 100;
        const skip = (page -1 ) * limit;
        query = query.skip(skip).limit(limit)
        if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error('this page does not exist')
        }
        // execute query
        const tours = await query
        // send response
        res.json({
        status: 'successfully',
        result: tours.length,
        data: tours
    })
    } catch (error) {
        res.status(404).json({
            status:"failed",
            message:error.message
        })
    }
     
   
} 
exports.createMultipleTour = async (req,res)=>{
    try {
        const rawData = fs.readFileSync(`${__dirname}/../test/tourData.json`)
        const toursData = JSON.parse(rawData)
        const createTours = await Promise.all(toursData.map(async(tourData)=>{
            return await Tour.create(tourData)
        }))
        res.json({
            status: 'successfully',
            result: createTours.length,
            tours: createTours
          });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: error.message
          });
    }
}
