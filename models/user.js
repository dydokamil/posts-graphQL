const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const moment = require('moment')

const publicKey = fs.readFileSync('./public.key')
const privateKey = fs.readFileSync('./private.key')

function getNewToken () {
  return jwt.sign({}, privateKey, {
    algorithm: 'RS256',
    expiresIn: '18h'
  })
}

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: String,
  lastLogin: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  token: String
})

UserSchema.statics.removeUsers = function () {
  return this.remove({})
}

UserSchema.statics.createUser = function (username, email, password) {
  const User = this

  return bcrypt.hash(password, 10).then(hash => {
    const user = new User({ username, email, password: hash })
    return user.save()
  })
}

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password).then(same => same)
}

UserSchema.statics.login = function (username, password) {
  return this.findOne({ username })
    .then(user => {
      return user
        .comparePassword(password)
        .then(same => {
          if (!same) throw new Error('Password incorrect.')
          else {
            const token = getNewToken()
            return user.update({ token, lastLogin: moment.utc() }).then(() => {
              return token
            })
          }
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      throw err
    })
}

UserSchema.statics.verifyToken = function (userId, token) {
  return this.findById(userId).then(user => {
    return user.token === token
  })
}

module.exports = mongoose.model('User', UserSchema)
