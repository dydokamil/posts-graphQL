// const axios = require('axios')
// const mongoose = require('mongoose')
const { PubSub } = require('graphql-subscriptions')

const User = require('./models/user')
const Post = require('./models/post')
const Subject = require('./models/subject')

const pubsub = new PubSub()

const resolvers = {
  Subscription: {
    subjectAdded: {
      subscribe: () => pubsub.asyncIterator('subjectAdded')
    }
  },
  Query: {
    status: () => 'GraphQL status: OK',
    users: () => User.find({}).populate('posts'),
    user: (obj, args) => {
      // TODO create a list of acceptable parameters
      return User.findOne({ ...args })
        .populate('posts')
        .populate('subjects')
      // , Object.keys(args).join(' ')
    },
    posts: () => Post.find({}).populate('author'),
    post: (obj, args) => {
      return Post.findOne({ ...args }).populate('author')
    },
    subjects: () => Subject.find({}).populate('author'),
    subject: (obj, args) => {
      return Subject.findOne({ ...args })
        .populate('responses')
        .populate('author')
        .populate({
          path: 'responses',
          populate: { path: 'author', model: 'User' }
        })
    }
  },
  Mutation: {
    createUser: (obj, args) => {
      const { username, email, password } = args
      if (password.length === 0) throw new Error('Password can not be null.')

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

      return Subject.createSubject(token, { message, title }).then(subject => {
        pubsub.publish('subjectAdded', {
          subjectAdded: subject
        })

        return subject
      })

      // return Subject.createSubject(token, { message, title })
    },
    updatePassword: (obj, args) => {
      const { token, password } = args

      return User.updatePassword(token, password)
    },
    updateSubject: (obj, args) => {
      const { subjectId, token, message } = args

      return Subject.updateSubject(subjectId, token, { message })
    },
    editPost: (obj, args) => {
      const { postId, token, message } = args

      return Post.updatePost(postId, token, { message })
    },
    deletePost: (obj, args) => {
      const { postId, token } = args

      return Post.deletePost(postId, token)
    },
    deleteSubject: (obj, args) => {
      const { subjectId, token } = args

      return Subject.deleteSubject(subjectId, token)
    }
  }
}

module.exports = resolvers
