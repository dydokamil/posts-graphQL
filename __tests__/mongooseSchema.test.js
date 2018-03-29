const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Post = require('../models/post')
const User = require('../models/user')

describe('mongoose `Post` schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    password: 'test',
    username: 'User1',
    token: '001',
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

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return user.comparePassword(password).then(same => {
        expect(same).toBeTruthy()
      })
    })
  })

  it('passwords do not match', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return user.comparePassword(wrongPassword).then(same => {
        expect(same).not.toBeTruthy()
      })
    })
  })

  it('should get a token upon successful login', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return User.login(username, password).then(token => {
        expect(token.length).toBeGreaterThan(20)
        return User.findById(user._id).then(userWithToken => {
          expect(userWithToken.lastLogin).toBeDefined()
          expect(userWithToken.token).toBeDefined()
        })
      })
    })
  })

  it('should not get a token if password is incorrect', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return User.login(username, wrongPassword).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })

  it('should verify a valid token', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return User.verifyToken(user._id, token).then(valid => {
          expect(valid).toBeTruthy()
        })
      })
    })
  })

  it('should not verify an invalid token', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'
    const notReallyAToken = 'abcdef0123456789'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return User.verifyToken(user._id, notReallyAToken).then(valid => {
          expect(valid).not.toBeTruthy()
        })
      })
    })
  })

  it('should create a post when given a valid token', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Post.createPost(token, message).then(post => {
          expect(post.message).toBe(message)
          expect(post.author.equals(user._id)).toBeTruthy()
        })
      })
    })
  })

  it('should not create a post when given an invalid token', () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const message = 'Some message to save'
    const cheekyToken = '1234567890abcdef'

    return User.createUser(username, email, password).then(user => {
      return Post.createPost(cheekyToken, message).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })
})
