const mongoose = require('mongoose')
const { graphql } = require('graphql')

const { MONGO_URL_DEV } = require('../consts')
const User = require('../models/user')
const { Query } = require('../resolvers')
const schema = require('../schema')

describe('User GQL schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    username: 'User1',
    password: 'test',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['41224d776a326fb40f000002']
  }

  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await User.removeUsers()
  })

  beforeEach(async () => {
    const userInstance = new User(userData)
    await userInstance.save()
  })

  afterEach(async () => {
    await User.removeUsers()
  })

  afterAll(async done => {
    await mongoose.disconnect(done)
  })

  it('should respond with a list of users', async () => {
    const query = `
      {
        users {
          _id
          username
          email
          createdAt
          lastLogin
          posts {
            _id 
            createdAt 
            editedAt
            message
          }
        }
      } 
    `
    const result = await graphql(schema, query)
    const users = result.data.users
    expect(users.length).toBe(1)
    expect(users).toMatchSnapshot()
  })

  it('should respond with an object of a particular user', async () => {
    const { _id } = userData
    const query = `
      {
        user(_id: "${_id}") {
          _id
          username
          email
          createdAt
          lastLogin
          posts {
            _id 
            createdAt 
            editedAt
            message 
          }
        }
      }
    `

    const result = await graphql(schema, query)
    const user = result.data.user
    expect(user._id).toEqual(`${_id}`)
    expect(user).toMatchSnapshot()
  })

  it('should create a user', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const query = `
      mutation {
        createUser(
          username: "${username}" 
          email: "${email}"
          password: "${password}"
        ) {
          _id
          username
          email
          createdAt
          lastLogin
          posts {
            _id 
            createdAt 
            editedAt
            message  
          }
        }
      } 
    `

    const result = await graphql(schema, query)
    const createUser = result.data.createUser
    expect(createUser.username).toBe(username)
    expect(createUser.email).toBe(email)
  })

  it('should not fetch the password', async () => {
    const query = `
      mutation {
        createUser(
          username: "Jason2"
          email: "Jason2@jason.json"
          password: "test"
        ) {
          _id
          username
          email
          createdAt
          lastLogin
          password
        }
      } 
    `

    const result = await graphql(schema, query)
    expect(result).toMatchSnapshot()
  })
})
