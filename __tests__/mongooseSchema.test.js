const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Post = require('../models/post')
const User = require('../models/user')

describe('mongoose `Post` schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    password: 'test',
    username: 'User1',
    email: 'User1@gql.com',
    createdAt: '2018-12-12T13:00:00',
    lastLogin: '2018-12-12T03:14:07',
    posts: ['41224d776a326fb40f000002']
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
    await Post.removePosts()
    await User.removeUsers()
  })

  beforeEach(async () => {
    const userInstance = new User(userData)
    await userInstance.save()

    const postInstance = new Post(postData)
    await postInstance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
  })

  afterAll(done => {
    mongoose.disconnect(done)
  })

  it('should create 1 post', async () => {
    const result = await Post.find({})
    expect(result).toMatchSnapshot()
    expect(result.length).toBe(1)
  })

  it('should delete all posts', async () => {
    return Post.removePosts().then(() => {
      Post.find({}).then(posts => {
        expect(posts.length).toBe(0)
        expect(posts).toEqual([])
      })
    })
  })

  it('should create a user and hash their password', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)
      expect(user.email).toBe(email)
      expect(user.password).not.toBe(password)
    })
  })

  it('passwords match', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      user.comparePassword(password).then(same => {
        expect(same).toBeTruthy()
      })

      user.comparePassword(wrongPassword).then(same => {
        expect(same).not.toBeTruthy()
      })
    })
  })

  it('should get a token upon successful login', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return User.login(username, password).then(token => {
        expect(token.length).toBeGreaterThan(20)
        User.findById(user._id).then(userWithToken => {
          expect(userWithToken.lastLogin).toBeDefined()
        })

        return User.login(username, wrongPassword).catch(err => {
          expect(err).toMatchSnapshot()
        })
      })
    })
  })
})
