const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
    type Query {
        status: String
        users: [User]
    }

    type User {
        id: ID
        username: String
        email: String
        createdAt: String
        lastLogin: String
        posts: [ID]
    }
`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
