// const axios = require('axios')
const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./models/user')
const Post = require('./models/post')
const { MONGO_URL_DEV } = require('./consts')

mongoose.connect(MONGO_URL_DEV)

const resolvers = {
  Query: {
    status: () => 'GraphQL status: OK',
    users: () => User.find({}).populate('posts'),
    user: (obj, args) => {
      // TODO create a list of acceptable parameters
      return User.findOne({ ...args }).populate('posts')
      //, Object.keys(args).join(' ')
    },
    posts: () => Post.find({}).populate('author'),
    post: (obj, args) => {
      return Post.findOne({ ...args }).populate('author')
    }
  },
  Mutation: {
    createUser: (obj, args) => {
      const { username, email } = args
      const user = new User({ username, email, createdAt: moment.utc() })
      return user.save()
    },
    createPost: (obj, args) => {
      const { message, author } = args

      const post = new Post({ message, author })
      return post.save()
    }
  }
}

module.exports = resolvers
