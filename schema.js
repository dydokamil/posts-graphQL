const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  type Query {
    status: String
    users: [User]
    user(userId:ID): User
    posts: [Post]
  }

  type User {
    id: ID
    username: String
    email: String
    createdAt: String
    lastLogin: String
    posts: [ID]
  }

  type Post {
      id: ID
      author: User 
      createdAt: String
      editedAt: String
      message: String
  }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
