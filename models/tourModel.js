const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ' a tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'a tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'a tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
   
  },
  ratingsQuantity: {
    type: Number,
   
  },
  price: {
    type: Number,
    required: [true,'a tour must have a price'],
  },
  priceDisscount:Number,
  summary: {
    type: String,
    required: [true, 'a tour must have a summary'],
  },
  description: {
    type: String,
    trim:true
  },
  imageCover: {
    type: String,
    required: [true, 'a tour must have a cover image'],
  },
  images: {
    type: [String],
    
  },
  startDates: {
    type: [Date],
    
  },
  createdAt:{
    type: Date, 
    default: Date.now()
  }
}
);

// Export the model
module.exports = mongoose.model('Tour', TourSchema);
