const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./user')
// const Subject = require('./subject')

const Schema = mongoose.Schema

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: Number,
  editedAt: Number,
  message: String
})

PostSchema.statics.removePosts = function () {
  return this.remove({})
}

PostSchema.statics.updatePost = function (postId, token, details) {
  return User.verifyToken(token)
    .then(decoded => {
      return this.findById(postId).then(post => {
        if (!post.author.equals(decoded.userId)) {
          throw new Error('Authentication error.')
        }

        const { message } = details

        return post.update({ message, editedAt: moment().unix() })
      })
    })
    .catch(err => {
      throw err
    })
}

PostSchema.statics.deletePost = function (postId, token) {
  return User.verifyToken(token)
    .then(decoded => {
      return this.findById(postId).then(post => {
        if (!post) throw new Error('Post not found.')

        if (!post.author.equals(decoded.userId)) {
          throw new Error('Authencitation error')
        }

        return post
          .remove()
          .then(result => post)
          .catch(error => {
            throw error
          })
      })
    })
    .catch(err => {
      throw err
    })
}

module.exports = mongoose.model('Post', PostSchema)
