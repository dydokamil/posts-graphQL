const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./user')

const Schema = mongoose.Schema

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: String,
  editedAt: String,
  message: String
})

PostSchema.statics.removePosts = function () {
  return this.remove({})
}

PostSchema.statics.createPost = function (token, message) {
  return User.findOne({ token })
    .then(user => {
      if (!user) throw new Error('User not found')
      const post = new this({
        token,
        message,
        createdAt: moment.utc(),
        author: user._id
      })
      return post.save()
    })
    .catch(err => {
      throw err
    })
}

module.exports = mongoose.model('Post', PostSchema)
