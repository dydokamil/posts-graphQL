const mongoose = require('mongoose')
const { graphql } = require('graphql')

const { MONGO_URL_DEV } = require('../consts')
const User = require('../models/user')
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
    // const userInstance = new User(userData)
    // await userInstance.save()
  })

  afterEach(async () => {
    await User.removeUsers()
  })

  afterAll(async done => {
    await User.removeUsers()
    await mongoose.disconnect(done)
  })

  it('should respond with a list of users', () => {
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
    const userInstance = new User(userData)
    return userInstance.save().then(() => {
      return graphql(schema, query).then(result => {
        const users = result.data.users
        expect(users.length).toBe(1)
        expect(users).toMatchSnapshot()
      })
    })
  })

  it('should respond with an object of a particular user', () => {
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

    const userInstance = new User(userData)
    return userInstance.save().then(() => {
      return graphql(schema, query).then(result => {
        const user = result.data.user
        expect(user._id).toEqual(`${_id}`)
        expect(user).toMatchSnapshot()
      })
    })
  })

  it('should create a user', () => {
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

    return graphql(schema, query).then(result => {
      const createUser = result.data.createUser
      expect(createUser.username).toBe(username)
      expect(createUser.email).toBe(email)
    })
  })

  it('should not fetch the password using `createUser()`', () => {
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

    return graphql(schema, query).then(result => {
      expect(result.errors).toBeDefined()
      expect(result).toMatchSnapshot()
    })
  })

  it('should not fetch the password using `user()`', () => {
    const { _id } = userData
    const query = `
      {
        user(_id: "${_id}") {
          password
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

    return graphql(schema, query).then(result => {
      expect(result.errors).toBeDefined()
      expect(result).toMatchSnapshot()
    })
  })

  it('should not get passwords when listing users', () => {
    const query = `
    {
      users {
        _id
        username
        email
        createdAt
        lastLogin
        password
        posts {
          _id 
          createdAt 
          editedAt
          message
        }
      }
    } 
  `
    return graphql(schema, query).then(result => {
      expect(result.errors).toBeDefined()
      expect(result).toMatchSnapshot()
    })
  })

  it('should get a token upon successful login', () => {
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

    const loginQuery = `
      mutation {
        login(
          username: "${username}"
          password: "${password}"
        ) {
          token
        }
      }
    `

    return graphql(schema, query).then(result => {
      return graphql(schema, loginQuery).then(result2 => {
        const { token } = result2.data.login
        expect(token.length).toBeGreaterThan(50)
      })
    })
  })

  it('should get an error upon unsuccessful login', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const wrongPassword = 'testTEST'

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

    const loginQuery = `
      mutation {
        login(
          username: "${username}"
          password: "${wrongPassword}"
        ) {
          token
        }
      }
    `

    return graphql(schema, query).then(result => {
      return graphql(schema, loginQuery).then(result2 => {
        expect(result2.token).not.toBeDefined()
        expect(result2).toMatchSnapshot()
      })
    })
  })
})
