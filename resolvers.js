// const axios = require('axios')
const mongoose = require('mongoose')

const User = require('./models/user')
const Post = require('./models/post')
const Subject = require('./models/subject')

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
    },
    subjects: () => Subject.find({}),
    subject: (obj, args) => {
      return Subject.findOne({ ...args })
    }
  },
  Mutation: {
    createUser: (obj, args) => {
      const { username, email, password } = args
      const user = User.createUser(username, email, password)
      return user
    },
    createPost: (obj, args) => {
      const { subjectId, token, message } = args

      return Subject.createPost(subjectId, token, message)
    },
    login: (obj, args) => {
      const { username, password } = args
      return User.login(username, password)
    },
    createSubject: (obj, args) => {
      const { token, message, title } = args
      return Subject.createSubject(token, { message, title })
    },
    updatePassword: (obj, args) => {
      const { token, password } = args

      return User.updatePassword(token, password)
    },
    updateSubject: (obj, args) => {
      const { subjectId, token, message, title } = args

      return Subject.updateSubject(subjectId, token, {
        message,
        title
      })
    },
    editPost: (obj, args) => {
      const { postId, token, message } = args

      return Post.updatePost(postId, token, { message })
    },
    deletePost: (obj, args) => {
      const { postId, token } = args

      return Post.deletePost(postId, token)
    }
  }
}

module.exports = resolvers
