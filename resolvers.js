// const axios = require('axios')
const mongoose = require('mongoose')

const User = require('./models/user')
const Post = require('./models/post')
const { MONGO_URL_DEV } = require('./consts')

const resolvers = {
  Query: {
    status: () => 'GraphQL status: OK',
    users: () => User.find({}).populate('posts'),
    user: (obj, args) => {
      // TODO create a list of acceptable parameters
      return User.findOne({ ...args }).populate('posts')
      // , Object.keys(args).join(' ')
    },
    posts: () => Post.find({}).populate('author'),
    post: (obj, args) => {
      return Post.findOne({ ...args }).populate('author')
    }
  },
  Mutation: {
    createUser: (obj, args) => {
      const { username, email, password } = args
      const user = User.createUser(username, email, password)
      return user
    },
    createPost: (obj, args) => {
      const { message, author } = args

      const post = new Post({ message, author })
      return post.save()
    }
  }
}

module.exports = resolvers
