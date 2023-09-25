const mongoose = require('mongoose')
const Schema = mongoose.Schema

// const date = new Date().toDateString()

const exerciseSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  duration: {
    type: Number,
    required: false
  } ,
  date: Date,
  description: {
    type: String,
    required: true
  }
})

const Exercise = mongoose.model('Exercise', exerciseSchema)

module.exports = Exercise