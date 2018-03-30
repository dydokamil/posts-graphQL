// jest.mock('axios')

const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const User = require('../models/user')
const Post = require('../models/post')
const { Query, Mutation } = require('../resolvers')

describe('user resolver', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    password: 'test',
    username: 'User1',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['5abba8e47af4d91c259e12ee']
  }

  const postData = {
    _id: '5abba8e47af4d91c259e12ee',
    author: userData._id,
    createdAt: '2018-10-10T13:00:00',
    editedAt: '2018-10-10T13:00:00',
    message: 'Some message'
  }

  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await User.removeUsers()
    await Post.removePosts()
  })

  beforeEach(async () => {
    // const userInstance = new User(userData)
    // await userInstance.save()
    // const postInstance = new Post(postData)
    // await postInstance.save()
  })

  afterEach(async () => {
    await User.removeUsers()
    await Post.removePosts()
  })

  afterAll(async done => {
    await mongoose.disconnect(done)
  })

  it('should respond with users', () => {
    const userInstance = new User(userData)
    return userInstance.save().then(() => {
      return Query.users().then(users => {
        expect(users.length).toBe(1)
        expect(users).toMatchSnapshot()
      })
    })
  })

  it('should respond with a user', () => {
    const { _id } = userData

    const userInstance = new User(userData)
    const postInstance = new Post(postData)

    return userInstance.save().then(() => {
      return postInstance.save().then(() => {
        return Query.user({}, { _id }).then(user => {
          expect(user._id.equals(_id)).toBeTruthy()
          expect(user).toMatchSnapshot()
        })
      })
    })
  })

  it('should create a user', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    return Mutation.createUser({}, { username, email, password }).then(user => {
      expect(user.username).toEqual(username)
      expect(user.email).toEqual(email)
      expect(user.password).not.toBe(password)
    })
  })
})
