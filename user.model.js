const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// initialize User
let User;

// create userscheme
const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  log: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
})

// create a model from the userSchema and assign it to the existing variable Person.
User = mongoose.model('user', UserSchema)

module.exports = User