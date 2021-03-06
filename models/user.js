const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const moment = require('moment')

// const Post = require('./post')

const publicKey = fs.readFileSync('./public.key')
const privateKey = fs.readFileSync('./private.key')

function getNewToken (userId) {
  return new Promise(function (resolve, reject) {
    jwt.sign(
      { userId },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '18h'
      },
      function (err, token) {
        if (err) reject(err)
        else resolve(token)
      }
    )
  })
}

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: Number,
  lastLogin: Number,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
})

UserSchema.statics.removeUsers = function () {
  return this.remove({})
}

UserSchema.statics.createUser = function (username, email, password) {
  const User = this

  return hashPassword(password).then(hash => {
    const user = new User({
      username,
      email,
      password: hash,
      createdAt: moment().unix()
    })
    return user.save()
  })
}

function hashPassword (password) {
  return bcrypt.hash(password, 10).then(hash => {
    return hash
  })
}

UserSchema.statics.hashPassword = hashPassword

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password).then(same => same)
}

UserSchema.statics.login = function (username, password) {
  return this.findOne({ username })
    .then(user => {
      if (!user) throw new Error('User not found!')
      return user
        .comparePassword(password)
        .then(same => {
          if (!same) throw new Error('Password incorrect.')
          else {
            return getNewToken(user._id)
              .then(token => {
                return user.update({ lastLogin: moment().unix() }).then(() => {
                  return { token, username }
                })
              })
              .catch(err => {
                throw err
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

UserSchema.statics.verifyToken = function (token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, publicKey, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

// UserSchema.statics.tokenBelongsToUser = function (userId, token) {
//   return UserSchema.statics
//     .verifyToken(token)
//     .then(decoded => {
//       return this.findById(userId).then(user => {
//         if (!user) throw new Error('User not found.')
//         return user.token === token
//       })
//     })
//     .catch(err => {
//       throw err
//     })
// }

UserSchema.statics.updatePassword = function (token, password) {
  return UserSchema.statics
    .verifyToken(token)
    .then(decoded => {
      return this.findById(decoded.userId).then(user => {
        if (!user) throw new Error('Token invalid. Log in again.')

        if (password.length === 0) {
          throw new Error('Password too short.')
        }

        return hashPassword(password).then(hash => {
          return user.update({ password: hash }).then(result => result.ok)
        })
      })
    })
    .catch(err => {
      throw err
    })
}

module.exports = mongoose.model('User', UserSchema)
