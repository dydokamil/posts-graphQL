const mongoose = require('mongoose')
const moment = require('moment')
const fs = require('fs')
const jwt = require('jsonwebtoken')

const User = require('./user')

const publicKey = fs.readFileSync('./public.key')

const Schema = mongoose.Schema

const SubjectSchema = new Schema({
  author: Schema.Types.ObjectId,
  responses: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: String,
  editedAt: String,
  message: String,
  title: String
})

SubjectSchema.statics.removeSubjects = function () {
  return this.remove({})
}

SubjectSchema.statics.createSubject = function (token, details) {
  return User.verifyToken(token)
    .then(decoded => {
      return User.findById(decoded.userId)
        .then(user => {
          if (!user) throw new Error('Token invalid. Please log in again.')

          const { message, title } = details

          const subject = new this({
            author: user._id,
            message,
            title,
            createdAt: moment.utc()
          })
          return subject.save()
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      throw err
    })
}

SubjectSchema.statics.updateSubject = function (subjectId, token, details) {
  return User.verifyToken(token)
    .then(decoded => {
      return this.findById(subjectId).then(subject => {
        if (!subject) throw new Error('Subject not found')

        return User.findById(subject.author).then(user => {
          if (!user) throw new Error('User not found')

          if (!user._id.equals(decoded.userId)) {
            throw new Error('Authentication error')
          }

          const { message, title } = details

          return subject.update({ message, title, editedAt: moment.utc() })
        })
      })
    })
    .catch(err => {
      throw err
    })
}

module.exports = mongoose.model('Subject', SubjectSchema)
