const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./user')

const Schema = mongoose.Schema

const SubjectSchema = new Schema({
  author: Schema.Types.ObjectId,
  responses: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: String,
  editedAt: String,
  message: String
})

SubjectSchema.statics.removeSubjects = function () {
  return this.remove({})
}

SubjectSchema.statics.createSubject = function (token, message) {
  return User.findOne({ token })
    .then(user => {
      if (!user) throw new Error('Token invalid. Please log in again.')

      const subject = new this({
        author: user._id,
        message,
        createdAt: moment.utc()
      })
      return subject.save()
    })
    .catch(err => {
      throw err
    })
}

module.exports = mongoose.model('Subject', SubjectSchema)
