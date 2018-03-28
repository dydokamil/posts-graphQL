const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: String,
  createdAt: String,
  lastLogin: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
})

UserSchema.statics.removeUsers = function (cb) {
  return this.remove({}, cb)
}

module.exports = mongoose.model('User', UserSchema)
