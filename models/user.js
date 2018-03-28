const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: String,
  lastLogin: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
})

UserSchema.statics.removeUsers = function (cb) {
  return this.remove({}, cb)
}

UserSchema.statics.createUser = function (username, email, password, cb) {
  const User = this

  return bcrypt.hash(password, 10).then(function (hash) {
    const user = new User({ username, email, password: hash })
    return user.save()
  })
}

module.exports = mongoose.model('User', UserSchema)
