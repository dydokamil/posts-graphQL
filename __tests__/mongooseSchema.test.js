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
    await Post.removePosts()
    const posts = await Post.find({})
    expect(posts.length).toBe(0)
    expect(posts).toEqual([])
  })

  it('should create a user and hash their password', async () => {
    const username = 'User2'
    const email = 'User2@user.com'
    const password = 'test'

    const user = await User.createUser(username, email, password)
    expect(user.username).toBe(username)
    expect(user.email).toBe(email)
    expect(user.password).not.toBe(password)
  })
})
