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
  }

  type Post {
    _id: ID
    author: User 
    createdAt: String
    editedAt: String
    message: String
  }

  type Query {
    status: String
    users: [User]
    user(_id: ID): User
    posts: [Post]
    post(_id: ID): Post
  }

  type Mutation {
    createPost(
      message: String
      author: ID!
    ): Post
    createUser(
      username: String! 
      email: String!
    ): User
  }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
