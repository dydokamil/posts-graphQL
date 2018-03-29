const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Post = require('../models/post')
const User = require('../models/user')
const Subject = require('../models/subject')

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

  const subjectData = {
    author: '5abba8e47af4d91c259e12ef',
    responses: ['5abba8e47af4d91c259e12ee'],
    createdAt: '2018-10-10T13:00:00',
    editedAt: '2018-10-10T13:00:00',
    message: 'Some other message'
  }

  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await Post.removePosts()
    await User.removeUsers()
    await Subject.removeSubjects()
  })

  beforeEach(async () => {
    const userInstance = new User(userData)
    await userInstance.save()

    const postInstance = new Post(postData)
    await postInstance.save()

    const subjectInsance = new Subject(subjectData)
    await subjectInsance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
    await Subject.removeSubjects()
  })

  afterAll(done => {
    mongoose.disconnect(done)
  })

  it('should create 1 post', () => {
    return Post.find({}).then(result => {
      expect(result).toMatchSnapshot()
      expect(result.length).toBe(1)
    })
  })

  it('should delete all posts', () => {
    expect.assertions(2)

    return Post.removePosts().then(() => {
      return Post.find({}).then(posts => {
        expect(posts.length).toBe(0)
        expect(posts).toEqual([])
      })
    })
  })

  it('should delete all subjects', () => {
    expect.assertions(2)

    return Subject.removeSubjects().then(() => {
      return Subject.find({}).then(subjects => {
        expect(subjects.length).toBe(0)
        expect(subjects).toEqual([])
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
    expect.assertions(2)
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
    expect.assertions(1)

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

  it('should create a new subject given a valid token', () => {
    expect.assertions(4)

    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token, message).then(subject => {
          expect(subject.author.equals(user._id)).toBeTruthy()
          expect(subject.message).toBeDefined()
          expect(subject.createdAt).toBeDefined()
          expect(subject.editedAt).not.toBeDefined()
        })
      })
    })
  })

  it('should not create a new subject given an invalid token', () => {
    expect.assertions(1)

    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const message = 'Some message to save'
    const cheekyToken = '1234567890abcdef'

    return User.createUser(username, email, password).then(user => {
      return Subject.createSubject(cheekyToken, message).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })
})
