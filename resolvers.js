const { PubSub, withFilter } = require('graphql-subscriptions')
const mongoose = require('mongoose')

const User = require('./models/user')
const Post = require('./models/post')
const Subject = require('./models/subject')

const pubsub = new PubSub()

const resolvers = {
  Subscription: {
    subjectAdded: {
      subscribe: () => pubsub.asyncIterator('subjectAdded')
    },
    postAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('postAdded'),
        (payload, variables) => payload.subjectId === variables.subjectId
      )
    },
    postDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('postDeleted'),
        (payload, variables) => payload.subjectId.equals(variables.subjectId)
      )
    },
    postEdited: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('postEdited'),
        (payload, variables) => payload.subjectId.equals(variables.subjectId)
      )
    },
    subjectEdited: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('subjectEdited'),
        (payload, variables) =>
          payload.subjectEdited._id.equals(variables.subjectId)
      )
    }
  },
  Query: {
    status: () => 'GraphQL status: OK',
    users: () => User.find({}).populate('posts'),
    user: (obj, args) => {
      return User.findOne({ _id: args._id })
        .populate('posts')
        .populate('subjects')
    },
    posts: () => Post.find({}).populate('author'),
    post: (obj, args) => {
      return Post.findOne({ ...args }).populate('author')
    },
    subjects: () => Subject.find({}).populate('author'),
    subject: (obj, args) =>
      Subject.findOne({ ...args })
        .populate('responses')
        .populate('author')
        .populate({
          path: 'responses',
          populate: { path: 'author', model: 'User' }
        })
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

      return Subject.createPost(subjectId, token, message).then(post => {
        pubsub.publish('postAdded', { postAdded: post, subjectId })

        return post
      })
    },
    login: (obj, args) => {
      const { username, password } = args
      return User.login(username, password)
    },
    createSubject: (obj, args) => {
      const { token, message, title } = args

      return Subject.createSubject(token, { message, title }).then(subject => {
        pubsub.publish('subjectAdded', { subjectAdded: subject })

        return subject
      })
    },
    updatePassword: (obj, args) => {
      const { token, password } = args

      return User.updatePassword(token, password)
    },
    updateSubject: (obj, args) => {
      const { subjectId, token, message } = args

      return Subject.updateSubject(subjectId, token, { message }).then(
        subjectEdited => {
          pubsub.publish('subjectEdited', { subjectEdited })
          return subjectEdited
        }
      )
    },
    editPost: (obj, args) => {
      const { postId, token, message } = args

      return Post.updatePost(postId, token, { message }).then(postEdited =>
        Subject.findOne({ responses: { _id: postId } }).then(subject => {
          pubsub.publish('postEdited', { postEdited, subjectId: subject._id })

          return postEdited
        })
      )
    },
    deletePost: (obj, args) => {
      let { postId, token } = args

      return Subject.findOne({
        responses: {
          _id: postId
        }
      }).then(subject =>
        Post.deletePost(postId, token).then(postDeleted => {
          pubsub.publish('postDeleted', { postDeleted, subjectId: subject._id })
        })
      )
    },
    deleteSubject: (obj, args) => {
      const { subjectId, token } = args

      return Subject.deleteSubject(subjectId, token)
    }
  }
}

module.exports = resolvers
