const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./user')
const Subject = require('./subject')

const Schema = mongoose.Schema

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: String,
  editedAt: String,
  message: String,
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' }
})

PostSchema.statics.removePosts = function () {
  return this.remove({})
}

PostSchema.statics.createPost = function (subjectId, token, message) {
  return User.verifyToken(token).then(decoded => {
    return User.findById(decoded.userId).then(user => {
      if (!user) throw new Error('Token invalid. Please log in again.')

      return Subject.findById(subjectId).then(subject => {
        if (!subject) throw new Error('Subject not found.')
        const post = new this({
          token,
          message,
          createdAt: moment.utc(),
          author: user._id,
          subject: subject._id
        })
        return post.save()
      })
    })
  })
}

module.exports = mongoose.model('Post', PostSchema)
