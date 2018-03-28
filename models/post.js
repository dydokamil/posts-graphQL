const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: String,
  editedAt: String,
  message: String
})

PostSchema.statics.removePosts = function (cb) {
  return this.remove({}, cb)
}

module.exports = mongoose.model('Post', PostSchema)
