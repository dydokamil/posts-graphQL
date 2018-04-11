const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    createdAt: String
    lastLogin: String
    posts: [Post]
    subjects: [Subject]
  }

  type Post {
    _id: ID
    author: User 
    createdAt: String
    editedAt: String
    message: String
  }

  type Token {
    token: String
    username: String
  }

  type Query {
    status: String
    users: [User]
    user(_id: String!): User
    posts: [Post]
    post(_id: String!): Post
    subject(_id: String!): Subject
    subjects: [Subject]
  }

  type Subscription {
    subjectAdded: Subject,
    postAdded(subjectId: String!): Post
    postDeleted(subjectId: String!): Post
    postEdited(subjectId: String!): Post
    subjectEdited(subjectId: String!): Subject
    subjectDeleted(subjectId: String!): Subject
  }

  type Subject {
    _id: ID
    author: User
    responses: [Post]
    createdAt: String
    editedAt: String
    message: String
    title: String
  }

  type Mutation {
    createPost(
      subjectId: String!
      token: String!
      message: String!
    ): Post

    createUser(
      username: String! 
      email: String!
      password: String!
    ): User

    login(
      username: String! 
      password: String!
    ): Token

    createSubject(
      token: String!
      message: String!
      title: String!
    ): Subject

    updatePassword(
      token: String!
      password: String!
    ): Int

    updateSubject(
      subjectId: String!
      token: String!
      message: String!
    ): Subject

    editPost(
      postId: String!
      token: String!
      message: String!
    ): Post

    deletePost(
      postId: String!
      token: String!
    ): Post

    deleteSubject(
      subjectId: String!
      token: String!
    ): Subject
  }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
